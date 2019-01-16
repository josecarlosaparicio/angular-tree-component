import { Component, ViewChild } from '@angular/core';
import { ITreeState, ITreeOptions, TreeComponent, TreeNode, TreeModel } from 'angular-tree-component';
import { v4 } from 'uuid';

@Component({
    selector: 'app-drag',
    template: `
    <h4>Allowing to drag only leaf nodes; ctrl-drag to copy</h4>
    <tree-root [state]="state" [options]="options" [focused]="true" [nodes]="nodes" #treeDragTest>
        <ng-template #treeNodeFullTemplate
            let-node
            let-index="index"
            let-templates="templates">
            <div
                [class]="node.getClass()"
                [class.tree-node]="true"
                [class.tree-node-expanded]="node.isExpanded && node.hasChildren"
                [class.tree-node-collapsed]="node.isCollapsed && node.hasChildren"
                [class.tree-node-leaf]="node.isLeaf"
                [class.tree-node-active]="node.isActive"
                [class.tree-node-focused]="node.isFocused">

                <tree-node-drop-slot
                                *ngIf="index === 0"
                                [dropIndex]="node.index"
                                [node]="node.parent">
                </tree-node-drop-slot>

                <div class="node-wrapper level-node-{{node.level}}" [style.padding-left]="node.getNodePadding()" >
                    <div class="node-content-wrapper"
                        [class.node-content-wrapper-active]="node.isActive"
                        [class.node-content-wrapper-focused]="node.isFocused"
                        (click)="node.mouseAction('click', $event)"
                        (dblclick)="node.mouseAction('dblClick', $event)"
                        (contextmenu)="node.mouseAction('contextMenu', $event)"
                        (treeDrop)="node.onDrop($event)"
                        [treeAllowDrop]="node.allowDrop">

                        <div class="node-content">
                            <span *ngIf="!node.editView">
                                {{ node.data.name }}
                                <button (click)="panelNode.activeEditMode(node)">ED</button>
                                <button (click)="panelNode.copyAction(node)">C</button>
                                <button (click)="panelNode.cutAction(node)">X</button>
                                <button (click)="panelNode.pasteAction(node)" *ngIf="nodeOnClipboard &&
                                    isAllowedToMoveOrCopy(nodeOnClipboard, node)">V</button>
                                <button
                                    class="dragable-style"
                                    [treeDrag]="node"
                                    [treeDragEnabled]="node.allowDrag()">DRAG</button>
                            </span>
                            <span *ngIf="node.editView">
                                <input type="text" [(ngModel)]="node.namePreviewEdit" />
                                <button (click)="panelNode.guardarCambioNombre(node)">Guardar</button>
                                <button (click)="panelNode.activeReadMode(node)">X</button>
                            </span>
                        </div>
                    </div>
                    <tree-node-expander [node]="node"></tree-node-expander>
                </div>

                <tree-node-children [node]="node" [templates]="templates">
                </tree-node-children>
                <tree-node-drop-slot [dropIndex]="node.index + 1" [node]="node.parent">
                </tree-node-drop-slot>
            </div>
        </ng-template>
    </tree-root>
    <button (click)="generateRandomNode()">genera</button>
  `,
    styleUrls: ['./materialDragDropStyle.css']
})
export class DragComponent {

    @ViewChild(TreeComponent)
    private treeDragTest: TreeComponent;

    panelNode = {
        activeEditMode: (node) => {
            node.namePreviewEdit = node.data.name;
            node.editView = true;
        },
        guardarCambioNombre: (node) => {
            node.data.name = node.namePreviewEdit;
            this.panelNode.activeReadMode(node);
        },
        activeReadMode: (node) => {
            node.editView = false;
        },
        copyAction: (node: TreeNode) => {
            this.nodeOnClipboard = node;
            this.clipBoardMode = 'COPY';
        },
        cutAction: (node: TreeNode) => {
            this.nodeOnClipboard = node;
            this.clipBoardMode = 'CUT';
        },
        pasteAction: (parent: TreeNode) => {
            if (this.nodeOnClipboard !== null) {
                this.doPaste(
                    this.treeDragTest.treeModel,
                    this.nodeOnClipboard , {
                        index: 0,
                        dropOnNode: true,
                        parent: parent
                    },
                    this.clipBoardMode
                );
                this.resetClipBoard();
            }
        }
    };

    state: ITreeState = {
        expandedNodeIds: {
            1: true,
            2: true
        },
        hiddenNodeIds: {},
        activeNodeIds: {}
    };

    clipBoardMode: 'CUT' | 'COPY' = null;
    nodeOnClipboard: TreeNode = null;


    options: ITreeOptions = {
        allowDrag: (node) => {
            return true;
        },
        allowDrop: (element, { parent, index }) => {
            // The level of the destination node must be the same of parent origin
            return this.isAllowedToMoveOrCopy(element, parent);
        },
        actionMapping: {
            mouse: {
                drop: (tree, node, $event, { from, to }) => {
                    this.doPaste(tree, from, to, 'CUT');
                }
            }
        },
        getNodeClone: (node) => ({
            ...node.data,
            id: v4(),
            name: `copy of ${node.data.name}`
        })
    };

    nodes = [
        {
            id: 1,
            name: 'Chapter 1',
            children: [
                { name: 'Subchapter 1.1' },
                { name: 'Subchapter 1.2' }
            ]
        },
        {
            name: 'Chapter 2',
            id: 2,
            children: [
                { name: 'Subchapter 2.1', children: [] },
                {
                    name: 'Subchapter 2.2', children: [
                        {
                            name: 'Test 2.2.1', children: [{
                                name: 'Step 2.2.1.1'
                            }, {
                                name: 'Step 2.2.1.2'
                            }, {
                                name: 'Step 2.2.1.3'
                            }]
                        }
                    ]
                }
            ]
        },
        { name: 'Chapter 3 ' },
        { name: 'Chapter 4', children: [] },
        {
            name: 'Chapter 5', children: [
                {
                    name: 'Subchapter 5.1', children: [
                        {
                            name: 'Test 5.1.1', children: [{
                                name: 'Step 5.1.1.1'
                            }, {
                                name: 'Step 5.1.1.2'
                            }, {
                                name: 'Step 5.1.1.3'
                            }]
                        }, {
                            name: 'Test 5.1.2', children: [{
                                name: 'Step 5.1.2.1'
                            }, {
                                name: 'Step 5.1.2.2'
                            }]
                        }
                    ]
                }
            ]
        }
    ];

    isAllowedToMoveOrCopy (node, parent) {
        return (node.level === (parent.level + 1));
    }

    doPaste(tree: TreeModel, from, to, action: 'CUT' | 'COPY') {
        this.recalculateIndexDropOnNode(to);
        if (this.isAllowedToMoveOrCopy(from, to.parent)) {
            if (action === 'CUT') {
                tree.moveNode(from, to);
            }
            if (action === 'COPY') {
                tree.copyNode(from, to);
            }
            tree.update();
        }
    }

    recalculateIndexDropOnNode(to) {
        // If drop is done in a node directly, then it set the index in order to
        // the node push it in the last position and not in the first one (default behaviour)
        if (to.dropOnNode && to.parent && to.parent.children && to.parent.children.length > 0) {
            to.index = to.parent.children.length;
        }
    }

    generateRandomNode() {
        const randomId = v4();
        this.nodes.push({ name: randomId, id: randomId });
        this.treeDragTest.treeModel.update();
    }

    resetClipBoard() {
        this.clipBoardMode = null;
        this.nodeOnClipboard = null;
    }

}
