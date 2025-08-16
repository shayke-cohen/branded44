import React from 'react';

export interface InspectableComponent {
  id: string;
  name: string;
  type: string;
  props: Record<string, any>;
  children?: InspectableComponent[];
  bounds?: DOMRect;
  element?: HTMLElement;
}

export interface InspectionResult {
  component: InspectableComponent;
  path: string[];
  depth: number;
}

export class ComponentInspector {
  private isInspecting: boolean = false;
  private inspectionOverlay: HTMLElement | null = null;
  private currentHighlight: HTMLElement | null = null;
  private onComponentSelect?: (component: InspectableComponent) => void;
  private componentMap: Map<HTMLElement, InspectableComponent> = new Map();

  constructor() {
    console.log('🔍 [ComponentInspector] Initializing component inspector...');
    this.createInspectionOverlay();
  }

  /**
   * Create the inspection overlay for highlighting components
   */
  private createInspectionOverlay(): void {
    this.inspectionOverlay = document.createElement('div');
    this.inspectionOverlay.id = 'component-inspector-overlay';
    this.inspectionOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 9999;
      background: transparent;
    `;

    // Create highlight element
    this.currentHighlight = document.createElement('div');
    this.currentHighlight.style.cssText = `
      position: absolute;
      border: 2px solid #3498db;
      background: rgba(52, 152, 219, 0.1);
      pointer-events: none;
      border-radius: 4px;
      transition: all 0.15s ease;
      display: none;
    `;

    this.inspectionOverlay.appendChild(this.currentHighlight);
  }

  /**
   * Start inspection mode
   */
  startInspection(container: HTMLElement, onSelect?: (component: InspectableComponent) => void): void {
    if (this.isInspecting) return;

    console.log('🔍 [ComponentInspector] Starting inspection mode...');
    this.isInspecting = true;
    this.onComponentSelect = onSelect;

    // Add overlay to container
    if (this.inspectionOverlay && container) {
      container.style.position = 'relative';
      container.appendChild(this.inspectionOverlay);
    }

    // Add event listeners
    this.addInspectionListeners(container);

    // Change cursor to indicate inspection mode
    container.style.cursor = 'crosshair';
  }

  /**
   * Stop inspection mode
   */
  stopInspection(container: HTMLElement): void {
    if (!this.isInspecting) return;

    console.log('🔍 [ComponentInspector] Stopping inspection mode...');
    this.isInspecting = false;

    // Remove overlay
    if (this.inspectionOverlay && container.contains(this.inspectionOverlay)) {
      container.removeChild(this.inspectionOverlay);
    }

    // Remove event listeners
    this.removeInspectionListeners(container);

    // Reset cursor
    container.style.cursor = 'default';

    // Hide highlight
    if (this.currentHighlight) {
      this.currentHighlight.style.display = 'none';
    }
  }

  /**
   * Add inspection event listeners
   */
  private addInspectionListeners(container: HTMLElement): void {
    container.addEventListener('mousemove', this.handleMouseMove);
    container.addEventListener('click', this.handleClick);
    container.addEventListener('mouseleave', this.handleMouseLeave);
  }

  /**
   * Remove inspection event listeners
   */
  private removeInspectionListeners(container: HTMLElement): void {
    container.removeEventListener('mousemove', this.handleMouseMove);
    container.removeEventListener('click', this.handleClick);
    container.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  /**
   * Handle mouse move during inspection
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isInspecting || !this.currentHighlight) return;

    const target = event.target as HTMLElement;
    const inspectableComponent = this.findInspectableComponent(target);

    if (inspectableComponent && inspectableComponent.element) {
      this.highlightComponent(inspectableComponent.element);
    } else {
      this.hideHighlight();
    }
  };

  /**
   * Handle click during inspection
   */
  private handleClick = (event: MouseEvent): void => {
    if (!this.isInspecting) return;

    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const inspectableComponent = this.findInspectableComponent(target);

    if (inspectableComponent && this.onComponentSelect) {
      console.log('🔍 [ComponentInspector] Component selected:', inspectableComponent);
      this.onComponentSelect(inspectableComponent);
    }
  };

  /**
   * Handle mouse leave during inspection
   */
  private handleMouseLeave = (): void => {
    this.hideHighlight();
  };

  /**
   * Find the nearest inspectable component
   */
  private findInspectableComponent(element: HTMLElement): InspectableComponent | null {
    let current = element;

    while (current && current !== document.body) {
      // Check if this element has component data
      const componentData = this.componentMap.get(current);
      if (componentData) {
        return componentData;
      }

      // Check for React component markers
      const reactComponent = this.extractReactComponent(current);
      if (reactComponent) {
        this.componentMap.set(current, reactComponent);
        return reactComponent;
      }

      current = current.parentElement as HTMLElement;
    }

    return null;
  }

  /**
   * Extract React component information from DOM element
   */
  private extractReactComponent(element: HTMLElement): InspectableComponent | null {
    try {
      // Look for React fiber data
      const fiberKey = Object.keys(element).find(key => 
        key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
      );

      if (fiberKey) {
        const fiber = (element as any)[fiberKey];
        if (fiber && fiber.type) {
          const componentName = this.getComponentName(fiber.type);
          const props = fiber.memoizedProps || fiber.pendingProps || {};

          return {
            id: this.generateComponentId(element),
            name: componentName,
            type: typeof fiber.type === 'string' ? 'native' : 'custom',
            props: this.sanitizeProps(props),
            bounds: element.getBoundingClientRect(),
            element: element
          };
        }
      }

      // Fallback: create component from element info
      if (element.tagName) {
        return {
          id: this.generateComponentId(element),
          name: element.tagName.toLowerCase(),
          type: 'native',
          props: this.extractElementProps(element),
          bounds: element.getBoundingClientRect(),
          element: element
        };
      }
    } catch (error) {
      console.warn('🔍 [ComponentInspector] Error extracting component:', error);
    }

    return null;
  }

  /**
   * Get component name from React type
   */
  private getComponentName(type: any): string {
    if (typeof type === 'string') {
      return type;
    }
    
    if (type && type.displayName) {
      return type.displayName;
    }
    
    if (type && type.name) {
      return type.name;
    }
    
    return 'Unknown';
  }

  /**
   * Generate unique component ID
   */
  private generateComponentId(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    
    return `${tagName}-${id}-${className}-${Date.now()}`.replace(/\s+/g, '-');
  }

  /**
   * Sanitize props for display
   */
  private sanitizeProps(props: any): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(props)) {
      // Skip React internal props and functions
      if (key.startsWith('__') || key === 'children' || typeof value === 'function') {
        continue;
      }
      
      // Convert complex objects to strings
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = JSON.stringify(value, null, 2);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Extract props from DOM element
   */
  private extractElementProps(element: HTMLElement): Record<string, any> {
    const props: Record<string, any> = {};
    
    // Get all attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      props[attr.name] = attr.value;
    }
    
    // Add computed styles for layout properties
    const computedStyle = window.getComputedStyle(element);
    props.style = {
      width: computedStyle.width,
      height: computedStyle.height,
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      fontSize: computedStyle.fontSize,
      fontFamily: computedStyle.fontFamily
    };
    
    return props;
  }

  /**
   * Highlight a component element
   */
  private highlightComponent(element: HTMLElement): void {
    if (!this.currentHighlight || !this.inspectionOverlay) return;

    const rect = element.getBoundingClientRect();
    const overlayRect = this.inspectionOverlay.getBoundingClientRect();

    this.currentHighlight.style.display = 'block';
    this.currentHighlight.style.left = `${rect.left - overlayRect.left}px`;
    this.currentHighlight.style.top = `${rect.top - overlayRect.top}px`;
    this.currentHighlight.style.width = `${rect.width}px`;
    this.currentHighlight.style.height = `${rect.height}px`;
  }

  /**
   * Hide the highlight
   */
  private hideHighlight(): void {
    if (this.currentHighlight) {
      this.currentHighlight.style.display = 'none';
    }
  }

  /**
   * Register a component for inspection
   */
  registerComponent(element: HTMLElement, component: InspectableComponent): void {
    this.componentMap.set(element, component);
  }

  /**
   * Unregister a component
   */
  unregisterComponent(element: HTMLElement): void {
    this.componentMap.delete(element);
  }

  /**
   * Get inspection status
   */
  isInspectionActive(): boolean {
    return this.isInspecting;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.inspectionOverlay && this.inspectionOverlay.parentElement) {
      this.inspectionOverlay.parentElement.removeChild(this.inspectionOverlay);
    }
    
    this.componentMap.clear();
    this.isInspecting = false;
    this.onComponentSelect = undefined;
  }
}

// Export singleton instance
export const componentInspector = new ComponentInspector();
