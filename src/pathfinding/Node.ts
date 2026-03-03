import type Orientation from "omino/pathfinding/orientation/Orientation.js";
import {type OType} from "omino/pathfinding/orientation/Orientation.js";

/**
 * Wrapper for a connection and the "other" node
 *
 * This is meant to be attached to a Node, and the "node" field
 * of this object is the other node in the connection between
 * the two nodes
 */
interface ConnWrapper<NodeType extends Node<OrienType, any>, OrienType extends OType>{
    connection:Connection<NodeType, OrienType>
    node:NodeType
}

/**
 * A connection with baked in orientation.
 */
class Connection<NodeType extends Node<OrienType, any>, OrienType extends OType> {
    public readonly node1:NodeType;
    public readonly node2:NodeType;
    public readonly direc1:OrienType;
    public readonly direc2:OrienType;
    public readonly wrapper1:ConnWrapper<NodeType, OrienType>;
    public readonly wrapper2:ConnWrapper<NodeType, OrienType>;

    //these directions are absolute
    constructor(node1:NodeType, direc1:OrienType, node2:NodeType, direc2:OrienType) {
        this.node1 = node1;
        this.direc1 = direc1;
        this.node2 = node2;
        this.direc2 = direc2;

        this.wrapper1 = {connection:this, node:node2};
        this.wrapper2 = {connection:this, node:node1};

        if (node1.connections[direc1])
            node1.connections[direc1].connection.disconnect();
        if (node2.connections[direc2])
            node2.connections[direc2].connection.disconnect();
        if (node1.historicalConnections[direc1])
            node1.historicalConnections[direc1].connection.disconnect();
        if (node2.historicalConnections[direc2])
            node2.historicalConnections[direc2].connection.disconnect();

        node1.connections[direc1] = this.wrapper1;
        node2.connections[direc2] = this.wrapper2;
        node1.historicalConnections[direc1] = this.wrapper1;
        node2.historicalConnections[direc2] = this.wrapper2;
    }

    disconnect() {
        delete this.node1.connections[this.direc1];
        delete this.node2.connections[this.direc2];
    }

    calcOtherOrientation(node:NodeType, orientation:Orientation<OrienType>) {
        if (node === this.node1)
            return orientation.getOtherOrientation(this.direc1, this.direc2, this.node2.defaultOrientation);
        if (node === this.node2)
            return orientation.getOtherOrientation(this.direc1, this.direc2, this.node1.defaultOrientation);
    }
}

/**
 * A node viewed from a certain orientation
 */
export class NodeView<NodeType extends Node<OrienType, any>, OrienType extends OType> {
    public readonly node:NodeType;
    public readonly orientation:Orientation<OrienType>;
    constructor(node:NodeType, orientation:Orientation<OrienType>) {
        this.node = node;
        this.orientation = orientation;
    }

    get(whichDirec:OrienType) {
        const orientation = this.getConn(whichDirec)?.calcOtherOrientation(this.node, this.orientation);
        if (!orientation) return undefined;
        const node=this.getNode(whichDirec);
        if(node===undefined) return undefined;
        return new NodeView(node, orientation);
    }

    getConnWrapper(whichDirec:OrienType) {
        return this.node.connections[this.orientation.apply(whichDirec)];
    }

    getConn(whichDirec:OrienType) {
        return this.getConnWrapper(whichDirec)?.connection;
    }

    getNode(whichDirec:OrienType) {
        return this.getConnWrapper(whichDirec)?.node;
    }

    //thisDirec and destDirec are both absolute
    connectNode(thisDirec:OrienType, destDirec:OrienType, destNode:Node<OrienType, any>) {
        new Connection(this.node, thisDirec,
            destNode, destDirec);
    }

    connectNodeFromView(thisDirec:OrienType, destDirec:OrienType, destView:NodeView<NodeType, OrienType>) {
        return this.connectNode(thisDirec, destDirec, destView.node);
    }

    //whichDirec is relative
    disconnect(whichDirec:OrienType) {
        this.node.connections[this.orientation.apply(whichDirec)]?.connection.disconnect();
    }

    disconnectHistorical(whichDirec:OrienType) {
        this.disconnect(whichDirec);
        this.node.historicalConnections[this.orientation.apply(whichDirec)]?.connection.disconnect();
    }

    detach() {
        this.node.detach();
    }
}

type ConnectionsAlias<T extends Node<OrienType,any>, OrienType extends OType> =
    { [key in OrienType]?: ConnWrapper<T, OrienType> };
/**
 * A node with no orientation
 */
export default class Node<OrienType extends OType, Custom> {
    public readonly connections:ConnectionsAlias<this, OrienType>;
    public readonly historicalConnections:ConnectionsAlias<this, OrienType>;
    public readonly custom:Custom;
    public readonly defaultOrientation:Orientation<OrienType>;
    public readonly id:number;
    constructor(defaultOrientation:Orientation<OrienType>, custom:Custom, id:number) {
        this.connections = {};
        this.historicalConnections = {};
        this.custom = custom;
        this.defaultOrientation = defaultOrientation;
        this.id=id;
    }

    getView(orientation = this.defaultOrientation) {
        return new NodeView(this, orientation);
    }

    detach() {
        for (const connWrapper of Object.values(this.connections))
            (connWrapper as ConnWrapper<this, OrienType>).connection.disconnect();
    }
}
