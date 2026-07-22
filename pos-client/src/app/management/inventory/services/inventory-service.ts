import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdjustInventoryInput,
  AdjustInventoryResult,
  InventoryTransaction,
} from '../../../shared/interfaces/inventory.interface';

@Service()
export class InventoryService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/inventory`;

  transactions = signal<InventoryTransaction[]>([]);

  async adjustInventory(input: AdjustInventoryInput): Promise<AdjustInventoryResult> {
    return await firstValueFrom(
      this.http.post<AdjustInventoryResult>(`${this.baseUrl}/adjust`, input),
    );
  }

  async getTransactionsByProduct(productId: string): Promise<void> {
    const transactions = await firstValueFrom(
      this.http.get<InventoryTransaction[]>(`${this.baseUrl}/${productId}/transactions`),
    );
    this.transactions.set(transactions);
  }
}
