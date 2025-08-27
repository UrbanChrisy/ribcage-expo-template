import { findNodeHandle, UIManager } from 'react-native';

interface LayoutInfo {
  handle: number;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  };
}

interface FiberType {
  displayName?: string;
  name?: string;
  $typeof?: symbol;
}

interface FiberNode {
  type: string | (Function & FiberType) | (FiberType & { $typeof: symbol }) | null;
  memoizedProps?: Record<string, unknown>;
  key: string | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  return?: FiberNode | null;
  _reactInternalFiber?: FiberNode;
  _reactInternalInstance?: FiberNode;
  _owner?: FiberNode;
}

interface NodeInfo {
  type: string;
  displayName: string;
  props: Record<string, unknown>;
  key: string | null;
  depth: number;
  children: NodeInfo[];
  layout?: LayoutInfo['layout'];
}

interface LayoutSummary {
  totalComponents: number;
  nativeComponents: number;
  customComponents: number;
  componentsWithLayout: number;
}

interface LayoutResult {
  timestamp: number;
  tree: NodeInfo | null;
  summary: LayoutSummary;
}

interface ReactDevToolsHook {
  renderers: Map<number, {
    findFiberByHostInstance?: Function;
    roots?: Set<{ current: FiberNode }>;
  }>;
}

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook;
  }
}

export type { LayoutInfo, NodeInfo, LayoutSummary, LayoutResult };

export class InspectorClient {
  private rootComponent: unknown | null = null;

  setRootComponent(component: unknown): void {
    this.rootComponent = component;
  }

  async getLayoutInfo(component: unknown): Promise<LayoutInfo | null> {
    return new Promise((resolve) => {
      const handle = findNodeHandle(component as never);
      if (handle) {
        UIManager.measure(handle, (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          resolve({
            handle,
            layout: { x, y, width, height, pageX, pageY }
          });
        });
      } else {
        resolve(null);
      }
    });
  }

  traverseReactTree(fiberNode: FiberNode | null, depth: number = 0): NodeInfo | null {
    if (!fiberNode) return null;

    const nodeInfo: NodeInfo = {
      type: this.getFiberType(fiberNode),
      displayName: this.getDisplayName(fiberNode),
      props: fiberNode.memoizedProps || {},
      key: fiberNode.key,
      depth,
      children: []
    };

    let child = fiberNode.child;
    while (child) {
      const childInfo = this.traverseReactTree(child, depth + 1);
      if (childInfo) {
        nodeInfo.children.push(childInfo);
      }
      child = child.sibling;
    }

    return nodeInfo;
  }

  private getFiberType(fiber: FiberNode): string {
    if (typeof fiber.type === 'string') {
      return fiber.type;
    } else if (typeof fiber.type === 'function') {
      const func = fiber.type as Function & FiberType;
      return func.displayName || func.name || 'Component';
    } else if (fiber.type && typeof fiber.type === 'object' && '$typeof' in fiber.type) {
      return 'ForwardRef/Memo';
    }
    return 'Unknown';
  }

  private getDisplayName(fiber: FiberNode): string {
    if (fiber.type && typeof fiber.type === 'object' && 'displayName' in fiber.type && fiber.type.displayName) {
      return fiber.type.displayName as string;
    }
    if (fiber.type && typeof fiber.type === 'function') {
      const func = fiber.type as Function & FiberType;
      return func.displayName || func.name || 'Anonymous';
    }
    if (typeof fiber.type === 'string') {
      return fiber.type;
    }
    return 'Anonymous';
  }

  private getReactFiberRoot(): FiberNode | null {
    if (!this.rootComponent) return null;

    const component = this.rootComponent as {
      _reactInternalFiber?: FiberNode;
      _reactInternalInstance?: FiberNode;
      _owner?: FiberNode;
    };

    if (component._reactInternalFiber) {
      return component._reactInternalFiber;
    } else if (component._reactInternalInstance) {
      return component._reactInternalInstance;
    } else if (component._owner) {
      let current = component._owner;
      while (current && current.return) {
        current = current.return;
      }
      return current;
    }
    return null;
  }

  async getLayoutTree(): Promise<NodeInfo | null> {
    try {
      if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        const renderers = hook.renderers;
        
        for (const [, renderer] of renderers) {
          if (renderer.findFiberByHostInstance) {
            const roots = renderer.roots || new Set();
            for (const root of roots) {
              const fiberRoot = root.current;
              const tree = this.traverseReactTree(fiberRoot);
              return await this.enrichWithLayoutInfo(tree);
            }
          }
        }
      }

      const fiberRoot = this.getReactFiberRoot();
      if (fiberRoot) {
        const tree = this.traverseReactTree(fiberRoot);
        return await this.enrichWithLayoutInfo(tree);
      }

      throw new Error('Unable to access React tree');
    } catch (error) {
      console.warn('Layout inspection failed:', error);
      return null;
    }
  }

  private async enrichWithLayoutInfo(tree: NodeInfo | null): Promise<NodeInfo | null> {
    if (!tree) return tree;

    if (typeof tree.type === 'string' && tree.props.ref) {
      const layoutInfo = await this.getLayoutInfo(tree.props.ref);
      if (layoutInfo) {
        tree.layout = layoutInfo.layout;
      }
    }

    for (const child of tree.children) {
      await this.enrichWithLayoutInfo(child);
    }

    return tree;
  }

  async getLayout(): Promise<LayoutResult> {
    const tree = await this.getLayoutTree();
    return {
      timestamp: Date.now(),
      tree,
      summary: this.generateSummary(tree)
    };
  }

  private generateSummary(tree: NodeInfo | null): LayoutSummary {
    if (!tree) return {
      totalComponents: 0,
      nativeComponents: 0,
      customComponents: 0,
      componentsWithLayout: 0
    };

    const summary: LayoutSummary = {
      totalComponents: 0,
      nativeComponents: 0,
      customComponents: 0,
      componentsWithLayout: 0
    };

    const traverse = (node: NodeInfo): void => {
      summary.totalComponents++;
      
      if (typeof node.type === 'string') {
        summary.nativeComponents++;
      } else {
        summary.customComponents++;
      }

      if (node.layout) {
        summary.componentsWithLayout++;
      }

      node.children?.forEach(traverse);
    };

    traverse(tree);
    return summary;
  }
}
