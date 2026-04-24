import Item from '../models/Item.js';

// @desc    Fetch all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error calling getItems' });
    }
};

// @desc    Fetch single item
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error calling getItemById' });
    }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private/Admin
export const createItem = async (req, res) => {
    try {
        const { name, marketPrice, discount, description, usageInstructions, shelfLifeStorage, images } = req.body;

        const item = new Item({
            name,
            marketPrice,
            discount,
            description,
            usageInstructions,
            shelfLifeStorage,
            images
        });

        const createdItem = await item.save();
        
        // Broadcast via socket.io
        req.app.get('io').emit('itemCreated', createdItem);
        
        res.status(201).json(createdItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create item', error: error.message, stack: error.stack });
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            item.name = req.body.name || item.name;
            item.marketPrice = req.body.marketPrice ?? item.marketPrice;
            item.discount = req.body.discount ?? item.discount;
            item.description = req.body.description ?? item.description;
            item.usageInstructions = req.body.usageInstructions ?? item.usageInstructions;
            item.shelfLifeStorage = req.body.shelfLifeStorage ?? item.shelfLifeStorage;
            if (req.body.images) {
                item.images = req.body.images;
            }

            const updatedItem = await item.save();
            req.app.get('io').emit('itemUpdated', updatedItem);
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update item' });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            await Item.deleteOne({ _id: item._id });
            req.app.get('io').emit('itemDeleted', req.params.id);
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete item' });
    }
};
