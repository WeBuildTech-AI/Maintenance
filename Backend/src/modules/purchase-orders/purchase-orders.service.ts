import { Injectable } from '@nestjs/common';
import { Prisma, PurchaseOrder } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

const toInputJson = (value: unknown | undefined): Prisma.InputJsonValue | undefined =>
  value === undefined ? undefined : (value as Prisma.InputJsonValue);

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  createPurchaseOrder(payload: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const data: Prisma.PurchaseOrderCreateInput = {
      organization: { connect: { id: payload.organizationId } },
      vendor: { connect: { id: payload.vendorId } },
      status: payload.status,
      items: payload.items as unknown as Prisma.InputJsonValue,
      taxesAndCosts: toInputJson(payload.taxesAndCosts),
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress,
      shippingContact: toInputJson(payload.shippingContact),
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      notes: payload.notes,
      files: payload.files,
    };

    return this.prisma.purchaseOrder.create({ data });
  }

  updatePurchaseOrder(id: string, payload: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const data: Prisma.PurchaseOrderUpdateInput = {
      ...(payload.organizationId
        ? { organization: { connect: { id: payload.organizationId } } }
        : {}),
      ...(payload.vendorId ? { vendor: { connect: { id: payload.vendorId } } } : {}),
      status: payload.status,
      items: payload.items !== undefined ? (payload.items as unknown as Prisma.InputJsonValue) : undefined,
      taxesAndCosts: payload.taxesAndCosts !== undefined ? toInputJson(payload.taxesAndCosts) : undefined,
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress,
      shippingContact: payload.shippingContact !== undefined ? toInputJson(payload.shippingContact) : undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      notes: payload.notes,
      files: payload.files,
    };

    return this.prisma.purchaseOrder.update({
      where: { id },
      data,
    });
  }

  findAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return this.prisma.purchaseOrder.findMany();
  }

  findPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id } });
  }
}
