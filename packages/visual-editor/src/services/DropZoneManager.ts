import React from 'react';

export interface DropZone {
  id: string;
  element: HTMLElement;
  bounds: DOMRect;
  accepts: string[]; // Component types this zone accepts
  onDrop: (componentType: string, data: any) => void;
  isActive: boolean;
}

export interface DropPreview {
  componentType: string;
  position: { x: number; y: number };
  targetZone?: DropZone;
}

export class DropZoneManager {
  private dropZones: Map<string, DropZone> = new Map();
  private activeDropZone: DropZone | null = null;
  private dropPreview: DropPreview | null = null;
  private previewElement: HTMLElement | null = null;
  private isDragging: boolean = false;
  private onDropCallback?: (zoneId: string, componentType: string, data: any) => void;

  constructor() {
    console.log('🎯 [DropZoneManager] Initializing drop zone manager...');
    this.createPreviewElement();
    this.setupGlobalListeners();
  }

  /**
   * Create the drop preview element
   */
  private createPreviewElement(): void {
    this.previewElement = document.createElement('div');
    this.previewElement.id = 'drop-preview';
    this.previewElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      background: rgba(52, 152, 219, 0.1);
      border: 2px dashed #3498db;
      border-radius: 8px;
      padding: 16px;
      font-size: 14px;
      color: #3498db;
      font-weight: 600;
      display: none;
      min-width: 120px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      backdrop-filter: blur(4px);
    `;
    document.body.appendChild(this.previewElement);
  }

  /**
   * Setup global drag and drop listeners
   */
  private setupGlobalListeners(): void {
    document.addEventListener('dragover', this.handleGlobalDragOver);
    document.addEventListener('drop', this.handleGlobalDrop);
    document.addEventListener('dragend', this.handleGlobalDragEnd);
  }

  /**
   * Register a drop zone
   */
  registerDropZone(
    id: string,
    element: HTMLElement,
    accepts: string[],
    onDrop: (componentType: string, data: any) => void
  ): void {
    const dropZone: DropZone = {
      id,
      element,
      bounds: element.getBoundingClientRect(),
      accepts,
      onDrop,
      isActive: false,
    };

    this.dropZones.set(id, dropZone);
    
    // Add drop zone styling
    element.style.position = 'relative';
    
    console.log(`🎯 [DropZoneManager] Registered drop zone: ${id}`, { accepts });
  }

  /**
   * Unregister a drop zone
   */
  unregisterDropZone(id: string): void {
    const dropZone = this.dropZones.get(id);
    if (dropZone) {
      this.deactivateDropZone(dropZone);
      this.dropZones.delete(id);
      console.log(`🎯 [DropZoneManager] Unregistered drop zone: ${id}`);
    }
  }

  /**
   * Start drag operation
   */
  startDrag(componentType: string, data: any): void {
    this.isDragging = true;
    console.log(`🎯 [DropZoneManager] Starting drag for component: ${componentType}`);
    
    // Activate compatible drop zones
    this.dropZones.forEach(zone => {
      if (zone.accepts.includes(componentType) || zone.accepts.includes('*')) {
        this.activateDropZone(zone);
      }
    });

    // Show preview
    if (this.previewElement) {
      this.previewElement.textContent = `📱 ${componentType}`;
      this.previewElement.style.display = 'block';
    }
  }

  /**
   * End drag operation
   */
  endDrag(): void {
    this.isDragging = false;
    console.log('🎯 [DropZoneManager] Ending drag operation');
    
    // Deactivate all drop zones
    this.dropZones.forEach(zone => this.deactivateDropZone(zone));
    this.activeDropZone = null;
    
    // Hide preview
    if (this.previewElement) {
      this.previewElement.style.display = 'none';
    }
    
    this.dropPreview = null;
  }

  /**
   * Update drag position
   */
  updateDragPosition(x: number, y: number): void {
    if (!this.isDragging) return;

    // Update preview position
    if (this.previewElement) {
      this.previewElement.style.left = `${x + 10}px`;
      this.previewElement.style.top = `${y + 10}px`;
    }

    // Find drop zone under cursor
    const targetZone = this.findDropZoneAt(x, y);
    
    if (targetZone !== this.activeDropZone) {
      // Deactivate previous zone
      if (this.activeDropZone) {
        this.highlightDropZone(this.activeDropZone, false);
      }
      
      // Activate new zone
      if (targetZone) {
        this.highlightDropZone(targetZone, true);
      }
      
      this.activeDropZone = targetZone;
    }
  }

  /**
   * Handle drop operation
   */
  handleDrop(componentType: string, data: any, x: number, y: number): boolean {
    const targetZone = this.findDropZoneAt(x, y);
    
    if (targetZone && (targetZone.accepts.includes(componentType) || targetZone.accepts.includes('*'))) {
      console.log(`🎯 [DropZoneManager] Dropping ${componentType} in zone: ${targetZone.id}`);
      
      // Calculate relative position within the drop zone
      const zoneBounds = targetZone.element.getBoundingClientRect();
      const relativeX = x - zoneBounds.left;
      const relativeY = y - zoneBounds.top;
      
      // Call the zone's drop handler
      targetZone.onDrop(componentType, {
        ...data,
        position: { x: relativeX, y: relativeY },
        absolutePosition: { x, y }
      });
      
      // Call global drop callback if set
      if (this.onDropCallback) {
        this.onDropCallback(targetZone.id, componentType, data);
      }
      
      this.endDrag();
      return true;
    }
    
    console.log('🎯 [DropZoneManager] Drop rejected - no valid target zone');
    this.endDrag();
    return false;
  }

  /**
   * Find drop zone at coordinates
   */
  private findDropZoneAt(x: number, y: number): DropZone | null {
    for (const zone of Array.from(this.dropZones.values())) {
      const bounds = zone.element.getBoundingClientRect();
      if (
        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom
      ) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Activate a drop zone
   */
  private activateDropZone(zone: DropZone): void {
    zone.isActive = true;
    zone.element.classList.add('drop-zone-active');
    
    // Add visual styling
    const originalTransition = zone.element.style.transition;
    zone.element.style.transition = 'all 0.2s ease';
    zone.element.style.boxShadow = 'inset 0 0 0 2px rgba(52, 152, 219, 0.3)';
    zone.element.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
    
    // Restore original transition after animation
    setTimeout(() => {
      zone.element.style.transition = originalTransition;
    }, 200);
  }

  /**
   * Deactivate a drop zone
   */
  private deactivateDropZone(zone: DropZone): void {
    zone.isActive = false;
    zone.element.classList.remove('drop-zone-active', 'drop-zone-highlight');
    
    // Remove visual styling
    zone.element.style.boxShadow = '';
    zone.element.style.backgroundColor = '';
  }

  /**
   * Highlight/unhighlight a drop zone
   */
  private highlightDropZone(zone: DropZone, highlight: boolean): void {
    if (highlight) {
      zone.element.classList.add('drop-zone-highlight');
      zone.element.style.boxShadow = 'inset 0 0 0 3px #3498db';
      zone.element.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    } else {
      zone.element.classList.remove('drop-zone-highlight');
      zone.element.style.boxShadow = zone.isActive ? 'inset 0 0 0 2px rgba(52, 152, 219, 0.3)' : '';
      zone.element.style.backgroundColor = zone.isActive ? 'rgba(52, 152, 219, 0.05)' : '';
    }
  }

  /**
   * Global drag over handler
   */
  private handleGlobalDragOver = (event: DragEvent): void => {
    if (!this.isDragging) return;
    
    event.preventDefault();
    this.updateDragPosition(event.clientX, event.clientY);
  };

  /**
   * Global drop handler
   */
  private handleGlobalDrop = (event: DragEvent): void => {
    if (!this.isDragging) return;
    
    event.preventDefault();
    
    try {
      const dragData = event.dataTransfer?.getData('application/json');
      if (dragData) {
        const data = JSON.parse(dragData);
        this.handleDrop(data.componentType, data, event.clientX, event.clientY);
      }
    } catch (error) {
      console.error('🎯 [DropZoneManager] Error handling drop:', error);
      this.endDrag();
    }
  };

  /**
   * Global drag end handler
   */
  private handleGlobalDragEnd = (): void => {
    if (this.isDragging) {
      this.endDrag();
    }
  };

  /**
   * Set global drop callback
   */
  setDropCallback(callback: (zoneId: string, componentType: string, data: any) => void): void {
    this.onDropCallback = callback;
  }

  /**
   * Get all registered drop zones
   */
  getDropZones(): DropZone[] {
    return Array.from(this.dropZones.values());
  }

  /**
   * Check if currently dragging
   */
  isDragActive(): boolean {
    return this.isDragging;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    document.removeEventListener('dragover', this.handleGlobalDragOver);
    document.removeEventListener('drop', this.handleGlobalDrop);
    document.removeEventListener('dragend', this.handleGlobalDragEnd);
    
    if (this.previewElement && this.previewElement.parentElement) {
      this.previewElement.parentElement.removeChild(this.previewElement);
    }
    
    this.dropZones.clear();
    console.log('🎯 [DropZoneManager] Destroyed');
  }
}

// Export singleton instance
export const dropZoneManager = new DropZoneManager();
