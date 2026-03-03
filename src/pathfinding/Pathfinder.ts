/** Board Length Calculator
 * This file calculates the longest optimal length for any board,
 * hopefully it's commented well enough
 */

interface InternalNode{
    connections:InternalNode[]
    name:number
    dist:number|undefined
}

//recursive function that returns all tiles that are all connected
//to this one orthoganally
function getConnected(node:InternalNode, nodes:InternalNode[] = []) {
    if (nodes.includes(node)) return nodes;
    nodes.push(node);

    for (const connected of node.connections)
        getConnected(connected, nodes);

    return nodes;
}

//takes a starting tile and calculates every other tile's distance away from it,
//and stores that distance in the tile
//breadth first! otherwise itll lag so bad
function propagateDist(node:InternalNode, tilesToProcess:Set<InternalNode>|undefined) {
    if (tilesToProcess === undefined) {
        tilesToProcess = new Set();
        //controller
        node.dist = 0;
        propagateDist(node, tilesToProcess);
        do {
            for (const subTile of [...tilesToProcess.values()]) {
                subTile.dist = Math.min.apply(null, subTile.connections.map(t => t.dist).filter(d => d !== undefined)) + 1;
                propagateDist(subTile, tilesToProcess);
                tilesToProcess.delete(subTile);
            }
        } while (tilesToProcess.size > 0);
    } else {
        for (const connectedTile of node.connections)
            if (connectedTile.dist === undefined) tilesToProcess.add(connectedTile);
    }
}

/** back and forth algorithm
 *
 * 1. pick any tile in a group of connected tiles, this is the current tile
 * 2. define some tile that DOES NOT EXIST (for now, you'll see why later), this is the previous tile
 * 3. get the farthest points away from the current tile, this is list F (farthest)
 * 4. if the previous tile is in this list F, we have our longest shortest path: the path from previous to current.
 *        otherwise, set the previous tile to the current tile, and set the current tile to the first tile in list C.
 * 5. repeat from step 3
 */

//finds and returns the longest path in the given pool, starting from currPoint
function findLongestShortest(currNode:InternalNode, pool:InternalNode[], maybePaths:InternalNode[][],
                             data:{end:InternalNode|undefined, startFixed:boolean}) {
    //gets the longest path, starting from currPoint
    //using the back and forth algorithm
    //(there's also stuff in here if you have a fixed start or end)
    let prevPoint:InternalNode|undefined=undefined;
    while(true) {
        for (const point of pool) point.dist = undefined;
        propagateDist(currNode, undefined);

        let farthestPoints:InternalNode[];
        if (data.end === undefined) {
            farthestPoints = pool.sort((p1, p2) => p2.dist! - p1.dist!);
            farthestPoints = farthestPoints.filter(p => p.dist === farthestPoints[0]!.dist);
        } else {
            farthestPoints = [data.end];
        }

        const oldPrevPoint = prevPoint;
        prevPoint = currNode;
        currNode = farthestPoints[0]!;
        if (oldPrevPoint!==undefined && farthestPoints.includes(oldPrevPoint) || data.startFixed) break;
    }

    const maybePath = [currNode];
    while(true) {
        let last = maybePath[maybePath.length - 1]!;
        if (last.dist === 0) break;

        for (const connection of last.connections) {
            if (connection.dist != last.dist! - 1) continue;
            maybePath.push(connection);
            break;
        }
    }
    maybePaths.push(maybePath);
    return maybePath;
}

//the main function
/** data param format: one object with these properties
 * ? suffix means optional
 *
 * startPoint?: a node identifier
 * endPoint?: a node identifier
 * nodes: an array of arrays:
 *   identifier, [connected, connected, ...]
 */
async function calcLength(data:{nodes:([number, number[]])[], startPoint:number|undefined, endPoint:number|undefined}) {
    const namedTiles:{[key:number]:InternalNode} = {};
    const tempConnections:{[key:number]:number[]}={}
    for (const nodeData of data.nodes) {
        namedTiles[nodeData[0]] = {connections: [], name: nodeData[0], dist:undefined};
        tempConnections[nodeData[0]] = nodeData[1]
    }
    for (const node of Object.values(namedTiles)) {
        node.connections = tempConnections[node.name]!.map(id => namedTiles[id]!);
    }

    const startPoint = data.startPoint?namedTiles[data.startPoint]:undefined;
    const endPoint = data.endPoint?namedTiles[data.endPoint]:undefined;

    const remainingTiles = new Set(Object.values(namedTiles));

    //split tiles into pools
    //a pool is just an area of connected tiles. on most boards there is only 1 pool but
    //we need to run the pathfinding algorithm on each pool just in case
    const pools = [];
    while(true) {
        if (remainingTiles.size === 0) break;

        const pool = getConnected(remainingTiles.values().next().value!, undefined);
        for (const tile of pool) remainingTiles.delete(tile);
        pools.push(pool);
    }

    //removing pools that dont have the start or end point (if there is one)
    if (startPoint !== undefined) {
        for (const pool of pools) {
            if (!pool.some(p => p === startPoint)) pool.length = 0;
        }
    }
    if (endPoint !== undefined) {
        for (const pool of pools) {
            if (!pool.some(p => p === endPoint)) pool.length = 0;
        }
    }

    //iterate through the pools
    const maybePaths:InternalNode[][] = [];
    for (const pool of pools) {
        if (pool.length === 0) continue;

        //if both start and end are specified
        if (startPoint!==undefined && endPoint!==undefined) {
            findLongestShortest(startPoint, pool, maybePaths, {startFixed: true, end: endPoint});

            //if only one is specified
        } else if (startPoint!==undefined || endPoint!=undefined) {
            let start = (startPoint || endPoint)!;
            findLongestShortest(start, pool, maybePaths, {startFixed: true, end:undefined});

            //if neither are specified (raagh)
        } else {
            let didCheck = false;
            let bottleneckSize = Math.min.apply(null, pool.map(n => n.connections.length).filter(s => s > 0));
            for (const tile of pool) {
                //check if tile is at the bottleneck size
                if (tile.connections.length != bottleneckSize) continue;

                didCheck = true;
                findLongestShortest(tile, pool, maybePaths, {end:undefined, startFixed:false});
            }

            if (!didCheck) findLongestShortest(pool[0]!, pool, maybePaths, {end:undefined, startFixed:false});
        }
    }

    if (maybePaths.length === 0) return [];
    else return maybePaths.sort((p1, p2) => p2.length - p1.length)[0]!.map(p => p.name);
}

//-- communication stuff below here

let safePostMessage = postMessage;

function fake(newPostMessage: { (data: any): any; (message: any, targetOrigin: string, transfer?: Transferable[]): void; (message: any, options?: WindowPostMessageOptions): void; }) {
    safePostMessage = newPostMessage;
}

function onMessage(e:{data:{nodes: [number, number[]][], startPoint: number | undefined, endPoint: number | undefined}}) {
    calcLength(e.data).then(response => safePostMessage(response));
}

onmessage = onMessage;

export {onMessage, fake};
