import React from 'react';

// Generic entity configuration
export interface EntityConfig {
  id: string;
  name: string;
  type: string;
  component?: React.ComponentType<any>;
  componentKey?: string;
  icon?: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  relationships?: Record<string, string | string[]>;
}

// Registry for managing all entities
export class ComponentRegistry {
  private entities: Map<string, EntityConfig> = new Map();
  private components: Map<string, React.ComponentType<any>> = new Map();
  private typeGroups: Map<string, Set<string>> = new Map();
  private categoryGroups: Map<string, Set<string>> = new Map();

  // Register a component
  registerComponent(key: string, component: React.ComponentType<any>): void {
    this.components.set(key, component);
  }

  // Register an entity configuration
  registerEntity(config: EntityConfig): void {
    this.entities.set(config.id, config);
    
    // Group by type
    if (!this.typeGroups.has(config.type)) {
      this.typeGroups.set(config.type, new Set());
    }
    this.typeGroups.get(config.type)!.add(config.id);
    
    // Group by category
    if (config.category) {
      if (!this.categoryGroups.has(config.category)) {
        this.categoryGroups.set(config.category, new Set());
      }
      this.categoryGroups.get(config.category)!.add(config.id);
    }
  }

  // Register multiple entities at once
  registerEntities(configs: EntityConfig[]): void {
    configs.forEach(config => this.registerEntity(config));
  }

  // Get entity by ID
  getEntity(id: string): EntityConfig | undefined {
    return this.entities.get(id);
  }

  // Get component by key
  getComponent(key: string): React.ComponentType<any> | undefined {
    return this.components.get(key);
  }

  // Get component for entity
  getEntityComponent(entityId: string): React.ComponentType<any> | undefined {
    const entity = this.getEntity(entityId);
    if (!entity) return undefined;
    
    if (entity.component) return entity.component;
    if (entity.componentKey) return this.getComponent(entity.componentKey);
    
    return undefined;
  }

  // Get entities by type
  getEntitiesByType(type: string): EntityConfig[] {
    const ids = this.typeGroups.get(type);
    if (!ids) return [];
    
    return Array.from(ids)
      .map(id => this.getEntity(id))
      .filter((entity): entity is EntityConfig => entity !== undefined);
  }

  // Get entities by category
  getEntitiesByCategory(category: string): EntityConfig[] {
    const ids = this.categoryGroups.get(category);
    if (!ids) return [];
    
    return Array.from(ids)
      .map(id => this.getEntity(id))
      .filter((entity): entity is EntityConfig => entity !== undefined);
  }

  // Get entities by tags
  getEntitiesByTags(tags: string[], matchAll: boolean = false): EntityConfig[] {
    const allEntities = Array.from(this.entities.values());
    
    return allEntities.filter(entity => {
      if (!entity.tags) return false;
      
      if (matchAll) {
        return tags.every(tag => entity.tags!.includes(tag));
      } else {
        return tags.some(tag => entity.tags!.includes(tag));
      }
    });
  }

  // Search entities
  searchEntities(query: string): EntityConfig[] {
    const lowercaseQuery = query.toLowerCase();
    const allEntities = Array.from(this.entities.values());
    
    return allEntities.filter(entity => {
      const searchFields = [
        entity.name,
        entity.description,
        entity.category,
        ...(entity.tags || [])
      ].filter(Boolean);
      
      return searchFields.some(field => 
        field!.toLowerCase().includes(lowercaseQuery)
      );
    });
  }

  // Get all types
  getAllTypes(): string[] {
    return Array.from(this.typeGroups.keys()).sort();
  }

  // Get all categories
  getAllCategories(): string[] {
    return Array.from(this.categoryGroups.keys()).sort();
  }

  // Get all entities
  getAllEntities(): EntityConfig[] {
    return Array.from(this.entities.values());
  }

  // Clear registry
  clear(): void {
    this.entities.clear();
    this.components.clear();
    this.typeGroups.clear();
    this.categoryGroups.clear();
  }

  // Get entity relationships
  getRelatedEntities(entityId: string, relationshipType?: string): EntityConfig[] {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.relationships) return [];
    
    const relatedIds: string[] = [];
    
    if (relationshipType && entity.relationships[relationshipType]) {
      const relationship = entity.relationships[relationshipType];
      if (Array.isArray(relationship)) {
        relatedIds.push(...relationship);
      } else {
        relatedIds.push(relationship);
      }
    } else {
      // Get all relationships
      Object.values(entity.relationships).forEach(relationship => {
        if (Array.isArray(relationship)) {
          relatedIds.push(...relationship);
        } else {
          relatedIds.push(relationship);
        }
      });
    }
    
    return relatedIds
      .map(id => this.getEntity(id))
      .filter((entity): entity is EntityConfig => entity !== undefined);
  }
}

// Create global registry instance
export const globalRegistry = new ComponentRegistry();

// Helper functions for common operations
export const registerComponent = (key: string, component: React.ComponentType<any>) => {
  globalRegistry.registerComponent(key, component);
};

export const registerEntity = (config: EntityConfig) => {
  globalRegistry.registerEntity(config);
};

export const registerEntities = (configs: EntityConfig[]) => {
  globalRegistry.registerEntities(configs);
};

export const getEntity = (id: string) => {
  return globalRegistry.getEntity(id);
};

export const getComponent = (key: string) => {
  return globalRegistry.getComponent(key);
};

export const getEntityComponent = (entityId: string) => {
  return globalRegistry.getEntityComponent(entityId);
};

export const getEntitiesByType = (type: string) => {
  return globalRegistry.getEntitiesByType(type);
};

export const getEntitiesByCategory = (category: string) => {
  return globalRegistry.getEntitiesByCategory(category);
};

export const searchEntities = (query: string) => {
  return globalRegistry.searchEntities(query);
};

export default globalRegistry; 