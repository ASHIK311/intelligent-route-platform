"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRO_CITY_GRAPH = void 0;
exports.createMetroCityGraph = createMetroCityGraph;
function createMetroCityGraph() {
    const nodes = [];
    const edges = [];
    const districts = [
        { name: 'Downtown Financial Hub', type: 'commercial', centerLat: 37.789, centerLng: -122.401 },
        { name: 'Midtown Commercial District', type: 'commercial', centerLat: 37.775, centerLng: -122.418 },
        { name: 'Silicon Tech Campus', type: 'industrial', centerLat: 37.755, centerLng: -122.392 },
        { name: 'Grand Central Transit Hub', type: 'transit_hub', centerLat: 37.783, centerLng: -122.410 },
        { name: 'West Suburbs Residential', type: 'residential', centerLat: 37.760, centerLng: -122.480 },
        { name: 'Sunset Residential Sector', type: 'residential', centerLat: 37.745, centerLng: -122.490 },
        { name: 'University Medical Campus', type: 'commercial', centerLat: 37.762, centerLng: -122.455 },
        { name: 'Bay Harbor Waterfront', type: 'commercial', centerLat: 37.805, centerLng: -122.420 },
        { name: 'Airport Gateway Corridor', type: 'transit_hub', centerLat: 37.715, centerLng: -122.395 },
        { name: 'North Hills Crest', type: 'residential', centerLat: 37.800, centerLng: -122.445 }
    ];
    let nodeIdCounter = 1;
    // Generate 100+ nodes distributed across the districts
    districts.forEach((dist, distIdx) => {
        // 10 nodes per district = 100 nodes total
        for (let i = 0; i < 10; i++) {
            const id = `node_${nodeIdCounter}`;
            const latOffset = (Math.sin(nodeIdCounter * 2.3) * 0.012);
            const lngOffset = (Math.cos(nodeIdCounter * 1.9) * 0.015);
            const lat = Math.round((dist.centerLat + latOffset) * 10000) / 10000;
            const lng = Math.round((dist.centerLng + lngOffset) * 10000) / 10000;
            let name = `${dist.name} - Junction ${i + 1}`;
            if (i === 0)
                name = `${dist.name} (Main Station)`;
            if (i === 1)
                name = `${dist.name} East Plaza`;
            if (i === 2)
                name = `${dist.name} West Gate`;
            nodes.push({
                id,
                name,
                lat,
                lng,
                type: dist.type,
                elevation: 10 + Math.round(Math.abs(Math.sin(nodeIdCounter) * 80)),
                tags: [dist.name.toLowerCase().replace(/\s+/g, '_')]
            });
            nodeIdCounter++;
        }
    });
    // Now create 500+ edges connecting intra-district and inter-district nodes
    let edgeIdCounter = 1;
    const addBidirectionalEdge = (u, v, roadType, tollCost = 0, traffic = 'LOW') => {
        // calculate Euclidean/Haversine approx distance
        const dLat = (v.lat - u.lat) * 111;
        const dLng = (v.lng - u.lng) * 88;
        const dist = Math.max(0.4, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 100) / 100);
        const speed = roadType === 'highway' || roadType === 'toll_road'
            ? 80
            : roadType === 'arterial'
                ? 45
                : 30;
        const baseTime = Math.round((dist / speed) * 60 * 10) / 10;
        const trafficMul = traffic === 'CONGESTED' ? 2.1 : traffic === 'HIGH' ? 1.6 : traffic === 'MEDIUM' ? 1.25 : 1.0;
        const currTime = Math.round(baseTime * trafficMul * 10) / 10;
        // predicted future conditions
        const predTime = Math.round(currTime * 1.15 * 10) / 10;
        const reliability = roadType === 'highway' ? 0.95 : roadType === 'arterial' ? 0.88 : 0.80;
        const risk = traffic === 'CONGESTED' ? 0.35 : traffic === 'HIGH' ? 0.22 : 0.08;
        edges.push({
            id: `edge_${edgeIdCounter++}`,
            source: u.id,
            target: v.id,
            distanceKm: dist,
            baseTravelTimeMin: baseTime,
            currentTravelTimeMin: currTime,
            predictedTravelTimeMin: predTime,
            monetaryCost: tollCost,
            trafficLevel: traffic,
            reliability,
            riskScore: risk,
            roadType,
            speedLimitKmH: speed
        });
        edges.push({
            id: `edge_${edgeIdCounter++}`,
            source: v.id,
            target: u.id,
            distanceKm: dist,
            baseTravelTimeMin: baseTime,
            currentTravelTimeMin: currTime,
            predictedTravelTimeMin: predTime,
            monetaryCost: tollCost,
            trafficLevel: traffic,
            reliability,
            riskScore: risk,
            roadType,
            speedLimitKmH: speed
        });
    };
    // 1. Intra-district connectivity: connect adjacent nodes in each district ring
    for (let distIdx = 0; distIdx < 10; distIdx++) {
        const startIdx = distIdx * 10;
        for (let i = 0; i < 10; i++) {
            const u = nodes[startIdx + i];
            const v = nodes[startIdx + ((i + 1) % 10)];
            const traffic = i % 3 === 0 ? 'MEDIUM' : 'LOW';
            addBidirectionalEdge(u, v, 'local', 0, traffic);
            // cross-connect inside district
            if (i < 5) {
                const cross = nodes[startIdx + i + 4];
                addBidirectionalEdge(u, cross, 'arterial', 0, traffic);
            }
            if (i < 4) {
                const cross2 = nodes[startIdx + i + 3];
                addBidirectionalEdge(u, cross2, 'local', 0, 'LOW');
            }
        }
    }
    // 2. Inter-district Arterial and Highway Network
    // Connect district centers to create metropolitan arterial mesh
    for (let d1 = 0; d1 < 10; d1++) {
        for (let d2 = d1 + 1; d2 < 10; d2++) {
            const u = nodes[d1 * 10]; // main hub of d1
            const v = nodes[d2 * 10]; // main hub of d2
            // Connect if within geographical proximity or key transit corridor
            const dLat = Math.abs(u.lat - v.lat);
            const dLng = Math.abs(u.lng - v.lng);
            if (dLat < 0.06 && dLng < 0.07) {
                // Express Highway
                const isToll = (d1 === 0 && d2 === 7) || (d1 === 2 && d2 === 8);
                const tollCost = isToll ? 3.5 : 0;
                const traffic = d1 === 0 || d2 === 0 ? 'HIGH' : 'MEDIUM';
                addBidirectionalEdge(u, v, isToll ? 'toll_road' : 'highway', tollCost, traffic);
            }
            else if (dLat < 0.09 && dLng < 0.09) {
                // Arterial connector
                addBidirectionalEdge(u, v, 'arterial', 0, 'LOW');
            }
        }
    }
    // 3. Connect secondary nodes to neighbors to ensure rich multi-path redundancy (>500 edges)
    for (let d = 0; d < 9; d++) {
        const u1 = nodes[d * 10 + 2];
        const v1 = nodes[(d + 1) * 10 + 1];
        addBidirectionalEdge(u1, v1, 'arterial', 0, 'MEDIUM');
        const u2 = nodes[d * 10 + 5];
        const v2 = nodes[(d + 1) * 10 + 6];
        addBidirectionalEdge(u2, v2, 'local', 0, 'LOW');
        const u3 = nodes[d * 10 + 7];
        const v3 = nodes[(d + 1) * 10 + 8];
        addBidirectionalEdge(u3, v3, 'arterial', 0, 'LOW');
        // diagonal bypass links
        const u4 = nodes[d * 10 + 3];
        const v4 = nodes[((d + 2) % 10) * 10 + 4];
        addBidirectionalEdge(u4, v4, 'highway', d % 2 === 0 ? 1.5 : 0, 'LOW');
    }
    // Ensure high-congestion express alternative:
    // e.g. Node 1 (Downtown) -> Node 71 (Bay Harbor) via Highway Toll vs Arterial Free
    const dtMain = nodes[0];
    const bayMain = nodes[70];
    addBidirectionalEdge(dtMain, bayMain, 'toll_road', 4.0, 'HIGH');
    return {
        id: 'graph_metro_1',
        name: 'Metropolitan Urban Road Network',
        description: '100 nodes, 500+ edges multi-objective urban network with highway, arterial, and toll corridors',
        nodes,
        edges
    };
}
exports.METRO_CITY_GRAPH = createMetroCityGraph();
//# sourceMappingURL=city_graph.js.map