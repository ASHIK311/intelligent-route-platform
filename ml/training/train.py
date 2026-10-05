"""
ML Training Script - Gradient Boosting Regressor for Travel Time Prediction
Compatible with scikit-learn / XGBoost
"""

import json
import os
import math
import numpy as np

def load_data(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)

def extract_features(sample):
    inp = sample['input']
    total_min = inp['hour'] * 60 + inp['minute']
    rad = (total_min / 1440.0) * 2 * math.pi
    hour_sin = math.sin(rad)
    hour_cos = math.cos(rad)
    
    is_rush = 1.0 if not inp['isWeekend'] and ((450 <= total_min <= 570) or (990 <= total_min <= 1125)) else 0.0
    is_weekend = 1.0 if inp['isWeekend'] else 0.0
    
    traffic_map = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CONGESTED': 3}
    traffic_ord = traffic_map.get(inp['trafficLevel'], 1)
    
    is_highway = 1.0 if inp['roadType'] in ['highway', 'toll_road'] else 0.0
    is_arterial = 1.0 if inp['roadType'] == 'arterial' else 0.0
    is_local = 1.0 if inp['roadType'] in ['local', 'residential'] else 0.0
    
    trend = inp.get('recentTrafficTrendRatio', 1.0)
    dist = inp['distanceKm']
    curr_time = inp['currentTravelTimeMin']
    
    return [
        hour_sin, hour_cos, is_rush, is_weekend, dist,
        curr_time, traffic_ord, is_highway, is_arterial, is_local, trend
    ]

def main():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'traffic_training_data.json')
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Please generate it first.")
        return

    data = load_data(data_path)
    print(f"Loaded {len(data)} samples.")
    
    X = np.array([extract_features(s) for s in data])
    y = np.array([s['actualTravelTimeMin'] for s in data])
    
    # Train / test split (80 / 20)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    try:
        from sklearn.ensemble import GradientBoostingRegressor
        from sklearn.metrics import mean_absolute_error, mean_squared_error
        
        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        
        print("\n--- MODEL TRAINING RESULTS ---")
        print(f"Test MAE: {mae:.2f} minutes")
        print(f"Test RMSE: {rmse:.2f} minutes")
        print(f"Feature Importances: {model.feature_importances_}")
        
    except ImportError:
        print("Note: scikit-learn is not installed in the python environment. Node.js native ML ensemble is used for production.")

if __name__ == '__main__':
    main()
