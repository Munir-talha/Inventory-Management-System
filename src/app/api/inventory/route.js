// app/api/inventory/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';
import Sale from '@/models/sale';
import Item from '@/models/item';
import '@/models/product_categories';

export async function GET() {
    try {
        await connectDB();

        // Step 1: Aggregate total purchased quantity
        const purchaseData = await Purchase.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$itemId',
                    totalPurchasedQty: { $sum: '$quantity' },
                    totalValue: { $sum: '$totalCost' },
                    lastPurchaseDate: { $max: '$purchaseDate' },
                    lastCostPerUnit: { $last: '$costPerUnit' },
                    purchaseCount: { $sum: 1 }
                }
            }
        ]);

        // Step 2: Aggregate total sold quantity
        const saleData = await Sale.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$itemId',
                    totalSoldQty: { $sum: '$quantity' }
                }
            }
        ]);

        // Step 3: Create maps for quick access
        const purchaseMap = new Map(purchaseData.map(p => [p._id.toString(), p]));
        const saleMap = new Map(saleData.map(s => [s._id.toString(), s.totalSoldQty]));

        // Step 4: Fetch all items
        const allItems = await Item.find({ isActive: true }).populate('categoryId');

        // Step 5: Merge and calculate availableQty
        const inventoryList = allItems.map(item => {
            const itemId = item._id.toString();
            const purchase = purchaseMap.get(itemId);
            const soldQty = saleMap.get(itemId) || 0;

            const purchasedQty = purchase?.totalPurchasedQty || 0;
            const availableQty = purchasedQty - soldQty;

            return {
                itemId: item._id,
                itemName: item.name,
                categoryName: item.categoryId?.name || 'N/A',
                minStockLevel: item.minStockLevel,
                currentStock: availableQty,
                totalValue: purchase?.totalValue || 0,
                lastPurchaseDate: purchase?.lastPurchaseDate || null,
                lastCostPerUnit: purchase?.lastCostPerUnit || 0,
                purchaseCount: purchase?.purchaseCount || 0,
                isLowStock: availableQty < item.minStockLevel
            };
        });

        return NextResponse.json({ success: true, data: inventoryList });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch inventory data'
        }, { status: 500 });
    }
}
