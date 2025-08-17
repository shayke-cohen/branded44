import React from 'react';

export interface ContentInfo {
  text: string; // innerText
  textContent: string; // textContent  
  className: string; // meaningful CSS classes
  styles: Record<string, string>; // computed styles
  attributes: Record<string, string>; // key attributes
  tagName: string; // HTML tag name
}

export interface InspectableComponent {
  id: string;
  name: string;
  type: string;
  props: Record<string, any>;
  children?: InspectableComponent[];
  bounds?: DOMRect;
  element?: HTMLElement;
  childStyled?: InspectableComponent; // For when a styled element has a parent React component
  hierarchy?: InspectableComponent[]; // Component hierarchy from clicked element to parents
  isEditable?: boolean; // Whether this component has editable source code
  contentInfo?: ContentInfo; // Extracted content for direct tracing
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
  private editMode: boolean = false;

  constructor() {
    console.log('🔍 [ComponentInspector] Initializing component inspector...');
    this.createInspectionOverlay();
    this.setupEditModeListener();
  }
  
  /**
   * Set up listener for edit mode changes
   */
  private setupEditModeListener(): void {
    const handleEditModeChange = (event: any) => {
      this.editMode = event.detail?.editMode || false;
      console.log('🔧 [ComponentInspector] Edit mode changed:', this.editMode);
    };
    
    window.addEventListener('inspector-edit-mode-changed', handleEditModeChange);
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
   * Handle mouse move during inspection with live code updates
   */
  private handleMouseMove = async (event: MouseEvent): Promise<void> => {
    if (!this.isInspecting || !this.currentHighlight) return;

    const target = event.target as HTMLElement;
    
    // Only find components that have traceable code
    const inspectableComponent = await this.findInspectableComponentWithCode(target);

    if (inspectableComponent && inspectableComponent.element) {
      // In edit mode, prefer highlighting editable components
      let targetElement = inspectableComponent.element;
      if (this.editMode && inspectableComponent.hierarchy) {
        const editableComponent = inspectableComponent.hierarchy.find(c => c.isEditable);
        if (editableComponent && editableComponent.element) {
          targetElement = editableComponent.element;
        }
      }
      
      this.highlightComponent(targetElement, inspectableComponent.isEditable || (this.editMode && inspectableComponent.hierarchy?.some(c => c.isEditable)));
      
      // Dispatch live code update
      this.dispatchLiveCodeUpdate(inspectableComponent);
    } else {
      this.hideHighlight();
      this.dispatchLiveCodeUpdate(null); // Clear code display
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
      
      // Emit hierarchy event for PropertyPanel
      if (inspectableComponent.hierarchy) {
        const hierarchyEvent = new CustomEvent('component-hierarchy-updated', {
          detail: { hierarchy: inspectableComponent.hierarchy }
        });
        window.dispatchEvent(hierarchyEvent);
        console.log('📍 [ComponentInspector] Hierarchy event dispatched with', inspectableComponent.hierarchy.length, 'levels');
      }
      
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
   * Find the nearest inspectable component and extract content for tracing
   */
  private findInspectableComponent(element: HTMLElement): InspectableComponent | null {
    const hierarchy = this.buildComponentHierarchy(element);
    
    if (hierarchy.length === 0) {
      console.log('🔍 [ComponentInspector] No component found, starting from:', element.tagName);
      return null;
    }
    
    // Extract content from the clicked element for tracing
    const contentInfo = this.extractContentInfo(element);
    
    // In edit mode, prioritize editable components
    let selectedComponent = hierarchy[0];
    if (this.editMode) {
      const editableComponent = hierarchy.find(c => c.isEditable);
      if (editableComponent) {
        selectedComponent = editableComponent;
        console.log('🔧 [ComponentInspector] Edit mode: prioritizing editable component:', editableComponent.name);
      }
    }
    
    selectedComponent.hierarchy = hierarchy;
    selectedComponent.contentInfo = contentInfo;
    
    console.log('🔍 [ComponentInspector] Built component hierarchy:', hierarchy.map(c => `${c.name}(${c.type}${c.isEditable ? '-editable' : ''})`).join(' → '));
    console.log('📝 [ComponentInspector] Extracted content info:', contentInfo);
    
    return selectedComponent;
  }

  /**
   * Extract content information from clicked element for direct tracing
   */
  private extractContentInfo(element: HTMLElement): ContentInfo {
    const info: ContentInfo = {
      text: '',
      textContent: '',
      className: '',
      styles: {},
      attributes: {},
      tagName: element.tagName.toLowerCase()
    };

    // Extract text content (the most important for tracing)
    info.textContent = element.textContent?.trim() || '';
    info.text = element.innerText?.trim() || '';
    
    // Extract meaningful classes (skip generated ones)
    if (element.className) {
      const meaningfulClasses = element.className.split(' ')
        .filter(cls => cls.length > 0 && cls.length <= 30 && !cls.includes('css-'))
        .join(' ');
      info.className = meaningfulClasses;
    }
    
    // Extract key attributes
    ['id', 'data-testid', 'role', 'aria-label', 'title', 'alt'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        info.attributes[attr] = value;
      }
    });
    
    // Extract computed styles for key visual properties
    const computedStyles = window.getComputedStyle(element);
    ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily', 'textAlign'].forEach(prop => {
      const value = computedStyles.getPropertyValue(prop);
      if (value && value !== 'initial' && value !== 'normal') {
        info.styles[prop] = value;
      }
    });
    
    return info;
  }

  /**
   * Find inspectable component with traceable source code
   */
  private async findInspectableComponentWithCode(element: HTMLElement): Promise<InspectableComponent | null> {
    const component = this.findInspectableComponent(element);
    
    if (!component) {
      return null;
    }

    // Check if this component has traceable code
    const hasCode = await this.hasTraceableCode(component);
    
    if (hasCode) {
      return component;
    }

    // If the current component doesn't have traceable code, try parents in hierarchy
    if (component.hierarchy) {
      for (const hierarchyComponent of component.hierarchy.slice(1)) { // Skip first (same as component)
        const parentHasCode = await this.hasTraceableCode(hierarchyComponent);
        if (parentHasCode) {
          return hierarchyComponent;
        }
      }
    }

    return null; // No component with traceable code found
  }

  /**
   * Check if a component has traceable source code
   */
  private async hasTraceableCode(component: InspectableComponent): Promise<boolean> {
    if (!component.contentInfo) {
      return false;
    }

    const { text, textContent, className } = component.contentInfo;
    
    // Must have meaningful content to trace
    if (!text?.trim() && !textContent?.trim() && !className?.trim()) {
      return false;
    }

    // Quick validation - if it's a React component or has meaningful text/classes, likely traceable
    if (component.type === 'custom' || component.isEditable) {
      return true;
    }

    if ((text && text.length > 2) || (textContent && textContent.length > 2)) {
      return true;
    }

    if (className && className.split(' ').some(cls => cls.length > 3 && !cls.includes('css-'))) {
      return true;
    }

    return false;
  }

  /**
   * Dispatch live code update event
   */
  private dispatchLiveCodeUpdate(component: InspectableComponent | null): void {
    const liveUpdateEvent = new CustomEvent('live-code-update', {
      detail: { component }
    });
    window.dispatchEvent(liveUpdateEvent);
    
    if (component) {
      console.log('📡 [ComponentInspector] Live code update dispatched for:', component.name);
    }
  }

  /**
   * Build a hierarchy of components from clicked element up to React components
   */
  private buildComponentHierarchy(element: HTMLElement): InspectableComponent[] {
    const hierarchy: InspectableComponent[] = [];
    let current = element;
    const visited = new Set<HTMLElement>();
    
    while (current && current !== document.body && !visited.has(current)) {
      visited.add(current);
      
      // Check for manually registered component
      const registeredComponent = this.componentMap.get(current);
      if (registeredComponent && !hierarchy.find(h => h.id === registeredComponent.id)) {
        hierarchy.push(registeredComponent);
      }
      
      // Try to extract component info
      const component = this.extractReactComponent(current);
      if (component && !hierarchy.find(h => h.id === component.id)) {
        // Mark as editable if it's a custom React component
        component.isEditable = component.type === 'custom';
        component.element = current;
        hierarchy.push(component);
        
        this.componentMap.set(current, component);
      }
      
      current = current.parentElement as HTMLElement;
    }
    
    return hierarchy;
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
          const isCustomComponent = typeof fiber.type !== 'string';

          // For custom React components, use meaningful IDs
          const componentId = isCustomComponent ? 
            componentName : // Use actual component name for custom components
            this.generateComponentId(element); // Keep generated ID for native elements

          console.log(`🔍 [ComponentInspector] Found ${isCustomComponent ? 'custom' : 'native'} component:`, componentName);

          return {
            id: componentId,
            name: componentName,
            type: isCustomComponent ? 'custom' : 'native',
            props: this.sanitizeProps(props),
            bounds: element.getBoundingClientRect(),
            element: element
          };
        }
      }

      // Fallback: create component from element info (inspect ALL elements)
      if (element.tagName) {
        const componentId = this.generateComponentId(element);
        const tagName = element.tagName.toLowerCase();
        
        console.log(`🔍 [ComponentInspector] Creating fallback component for:`, tagName, `(${componentId})`);
        
        return {
          id: componentId,
          name: tagName,
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
   * Check if element is a styled/CSS-in-JS element
   */
  private isStyledElement(element: HTMLElement): boolean {
    const className = element.className || '';
    
    // Detect CSS-in-JS class patterns (styled-components, emotion, etc.)
    if (className.includes('css-') || 
        className.includes('sc-') || 
        className.includes('emotion-') ||
        className.includes('r-') || // React Native Web classes
        className.length > 30) { // Very long class names are usually generated
      return true;
    }
    
    // Detect if it's a wrapper div with generated classes
    if (element.tagName.toLowerCase() === 'div' && 
        className.split(' ').some(cls => cls.length > 15)) {
      return true;
    }
    
    return false;
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
    const id = element.id;
    const className = element.className;
    
    // Create a shorter, more readable ID
    let componentId = tagName;
    
    // Add meaningful identifiers if available
    if (id) {
      componentId += `#${id}`;
    } else if (className) {
      // Use only the first few meaningful class names
      const meaningfulClasses = className.split(' ')
        .filter(cls => cls.length > 0 && cls.length <= 20) // Skip very long generated classes
        .slice(0, 2) // Take first 2 classes max
        .join('.');
      
      if (meaningfulClasses) {
        componentId += `.${meaningfulClasses}`;
      }
    }
    
    // Add timestamp to ensure uniqueness
    componentId += `-${Date.now()}`;
    
    return componentId.replace(/\s+/g, '-');
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
      
      // Convert complex objects to strings safely
      if (typeof value === 'object' && value !== null) {
        try {
          // Handle special object types
          if (value instanceof HTMLElement) {
            sanitized[key] = `<${value.tagName.toLowerCase()}${value.id ? ` id="${value.id}"` : ''}${value.className ? ` class="${value.className}"` : ''}/>`;
          } else if ((value as any).$$typeof) {
            // React element
            const reactElement = value as any;
            const typeName = typeof reactElement.type === 'string' ? reactElement.type : (reactElement.type?.name || reactElement.type || 'Unknown');
            sanitized[key] = `<React.Element type="${typeName}"/>`;
          } else if (Array.isArray(value)) {
            // Arrays
            sanitized[key] = `[${value.length} items]`;
          } else {
            // Try to stringify with circular reference protection
            sanitized[key] = JSON.stringify(value, this.getCircularReplacer(), 2);
          }
        } catch (error) {
          // If serialization fails, show type info instead
          sanitized[key] = `[${typeof value}${value.constructor?.name ? ` ${value.constructor.name}` : ''}]`;
        }
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Create a replacer function for JSON.stringify that handles circular references
   */
  private getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    };
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
  private highlightComponent(element: HTMLElement, isEditable?: boolean): void {
    if (!this.currentHighlight || !this.inspectionOverlay) return;

    const rect = element.getBoundingClientRect();
    const overlayRect = this.inspectionOverlay.getBoundingClientRect();

    this.currentHighlight.style.display = 'block';
    this.currentHighlight.style.left = `${rect.left - overlayRect.left}px`;
    this.currentHighlight.style.top = `${rect.top - overlayRect.top}px`;
    this.currentHighlight.style.width = `${rect.width}px`;
    this.currentHighlight.style.height = `${rect.height}px`;
    
    // Change highlight color based on editability
    if (isEditable) {
      this.currentHighlight.style.backgroundColor = 'rgba(76, 175, 80, 0.3)'; // Green for editable
      this.currentHighlight.style.borderColor = '#4caf50';
      this.currentHighlight.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    } else {
      this.currentHighlight.style.backgroundColor = 'rgba(33, 150, 243, 0.2)'; // Blue for non-editable
      this.currentHighlight.style.borderColor = '#2196f3';
      this.currentHighlight.style.boxShadow = '0 0 8px rgba(33, 150, 243, 0.3)';
    }
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
