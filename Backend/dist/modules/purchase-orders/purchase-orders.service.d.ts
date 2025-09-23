import { PurchaseOrder } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export declare class PurchaseOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createPurchaseOrder(payload: CreatePurchaseOrderDto): Promise<PurchaseOrder>;
    updatePurchaseOrder(id: string, payload: UpdatePurchaseOrderDto): Promise<PurchaseOrder>;
    findAllPurchaseOrders(): Promise<PurchaseOrder[]>;
    findPurchaseOrderById(id: string): Promise<PurchaseOrder>;
}
