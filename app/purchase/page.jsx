import { Suspense } from 'react';
import PurchasePage from './PurchaseContent';

export default function PurchaseWrapper() {
  return (
    <Suspense fallback={<div>Загрузка страницы покупки...</div>}>
      <PurchasePage />
    </Suspense>
  );
}
