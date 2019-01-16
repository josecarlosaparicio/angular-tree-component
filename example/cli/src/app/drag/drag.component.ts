import { Component, ViewChild } from '@angular/core';
import { ITreeState, ITreeOptions, TreeComponent } from 'angular-tree-component';
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

                <div class="node-wrapper" [style.padding-left]="node.getNodePadding()">
                    <div class="node-content-wrapper"
                        [class.node-content-wrapper-active]="node.isActive"
                        [class.node-content-wrapper-focused]="node.isFocused"
                        (click)="node.mouseAction('click', $event)"
                        (dblclick)="node.mouseAction('dblClick', $event)"
                        (contextmenu)="node.mouseAction('contextMenu', $event)"
                        (treeDrop)="node.onDrop($event)"
                        [treeAllowDrop]="node.allowDrop">

                        <div class="node-content">
                            <span *ngIf="!node.editView"
                             [treeDrag]="node"
                             [treeDragEnabled]="node.allowDrag()">
                                {{ node.data.name }}
                                <button (click)="panelNode.activeEditMode(node)">Editar</button>
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
    styles: []
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

    options: ITreeOptions = {
        allowDrag: (node) => {
            return true;
        },
        allowDrop: (element, { parent, index }) => {
            // The level of the destination node must be the same of parent origin
            return (element.level === (parent.level + 1));
        },
        actionMapping: {
            mouse: {
                drop: (tree, node, $event, { from, to }) => {
                    // If drop is done in a node directly, then it set the index in order to
                    // the node push it in the last position and not in the first one (default behaviour)
                    if (to.dropOnNode && to.parent && to.parent.children && to.parent.children.length > 0) {
                        to.index = to.parent.children.length;
                    }
                    tree.moveNode(from, to);
                    tree.update();
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
            name: 'root1',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            name: 'root2',
            id: 2,
            children: [
                { name: 'child2.1', children: [] },
                {
                    name: 'child2.2', children: [
                        { name: 'grandchild2.2.1' }
                    ]
                }
            ]
        },
        { name: 'root3' },
        { name: 'root4', children: [] },
        { name: 'root5', children: null }
    ];

    generateRandomNode() {
        const randomId = v4();
        this.nodes.push({ name: randomId, id: randomId });
        this.treeDragTest.treeModel.update();
    }
}
