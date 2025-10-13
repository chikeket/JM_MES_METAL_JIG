const db = require('../config/db');

class CoListViewService {
  // Get all list items
  async getAllLists() {
    try {
      const query = 'SELECT * FROM co_list_view';
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching lists: ${error.message}`);
    }
  }

  // Get list by ID
  async getListById(id) {
    try {
      const query = 'SELECT * FROM co_list_view WHERE id = ?';
      const [rows] = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching list by ID: ${error.message}`);
    }
  }

  // Create new list entry
  async createList(listData) {
    try {
      const query = 'INSERT INTO co_list_view SET ?';
      const [result] = await db.query(query, [listData]);
      return result;
    } catch (error) {
      throw new Error(`Error creating list: ${error.message}`);
    }
  }

  // Update list entry
  async updateList(id, listData) {
    try {
      const query = 'UPDATE co_list_view SET ? WHERE id = ?';
      const [result] = await db.query(query, [listData, id]);
      return result;
    } catch (error) {
      throw new Error(`Error updating list: ${error.message}`);
    }
  }

  // Delete list entry
  async deleteList(id) {
    try {
      const query = 'DELETE FROM co_list_view WHERE id = ?';
      const [result] = await db.query(query, [id]);
      return result;
    } catch (error) {
      throw new Error(`Error deleting list: ${error.message}`);
    }
  }
}

module.exports = new CoListViewService();