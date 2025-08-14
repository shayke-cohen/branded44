import axios from 'axios';

export class Src2Manager {
  private serverUrl = 'http://localhost:3001';

  async initializeEditingEnvironment(): Promise<void> {
    try {
      console.log('📁 [Src2Manager] Initializing editing environment...');
      
      // Make API call to server to initialize src2
      const response = await axios.post(`${this.serverUrl}/api/editor/init`, {
        action: 'initialize'
      });

      if (response.data.success) {
        console.log('📁 [Src2Manager] Editing environment initialized successfully');
      } else {
        throw new Error(response.data.error || 'Failed to initialize src2');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to initialize editing environment:', error);
      throw error;
    }
  }

  async cleanupEditingEnvironment(): Promise<void> {
    try {
      console.log('📁 [Src2Manager] Cleaning up editing environment...');

      // Make API call to server to cleanup src2
      const response = await axios.post(`${this.serverUrl}/api/editor/cleanup`, {
        action: 'cleanup'
      });

      if (response.data.success) {
        console.log('📁 [Src2Manager] Editing environment cleaned up successfully');
      } else {
        console.warn('📁 [Src2Manager] Cleanup warning:', response.data.error);
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to cleanup editing environment:', error);
      // Don't throw on cleanup errors
    }
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    try {
      console.log('📁 [Src2Manager] Writing file:', relativePath);

      // Make API call to server to write file
      const response = await axios.post(`${this.serverUrl}/api/editor/files/write`, {
        filePath: relativePath,
        content,
      });

      if (response.data.success) {
        console.log('📁 [Src2Manager] File written successfully:', relativePath);
      } else {
        throw new Error(response.data.error || 'Failed to write file');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to write file:', error);
      throw error;
    }
  }

  async readFile(relativePath: string): Promise<string> {
    try {
      console.log('📁 [Src2Manager] Reading file:', relativePath);

      // Make API call to server to read file
      const response = await axios.get(`${this.serverUrl}/api/editor/files/read`, {
        params: { filePath: relativePath }
      });

      if (response.data.success) {
        return response.data.content;
      } else {
        throw new Error(response.data.error || 'Failed to read file');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to read file:', error);
      throw error;
    }
  }

  async getFileTree(): Promise<any[]> {
    try {
      console.log('📁 [Src2Manager] Getting file tree...');

      // Make API call to server to get file tree
      const response = await axios.get(`${this.serverUrl}/api/editor/files/tree`);

      if (response.data.success) {
        return response.data.tree;
      } else {
        throw new Error(response.data.error || 'Failed to get file tree');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to get file tree:', error);
      throw error;
    }
  }
}
