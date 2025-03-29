const Client = require('../models/Client');

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const query = {};
    
    // If isActive parameter is provided, filter by it
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    const clients = await Client.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve clients',
      error: error.message
    });
  }
};

// Get a single client
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve client',
      error: error.message
    });
  }
};

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    
    if (!clientId) {
      console.error('Delete client request missing ID parameter');
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }
    
    console.log(`[CLIENT DELETE] Attempting to delete client with ID: ${clientId}`);
    
    // First check if client exists
    const client = await Client.findById(clientId);
    
    if (!client) {
      console.log(`[CLIENT DELETE] Client not found with ID: ${clientId}`);
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    console.log(`[CLIENT DELETE] Found client to delete: ${client.name} (${clientId})`);
    
    // Delete the client using findByIdAndDelete for atomic operation
    const deletedClient = await Client.findByIdAndDelete(clientId);
    
    if (!deletedClient) {
      console.log(`[CLIENT DELETE] Deletion operation failed for client ID: ${clientId}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete client'
      });
    }
    
    console.log(`[CLIENT DELETE] Successfully deleted client: ${client.name} (${clientId})`);
    
    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
      data: { id: clientId }
    });
  } catch (error) {
    console.error(`[CLIENT DELETE] Error deleting client:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting client',
      error: error.message
    });
  }
}; 