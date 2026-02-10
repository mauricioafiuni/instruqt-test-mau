export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  onlineStock?: number | null;
  inStoreStock?: number | null;
  lowStockThreshold?: number;
  lastUpdated?: string;
  onlineInStock?: boolean;
  inStoreInStock?: boolean;
  inventoryUnavailable?: boolean;
}
