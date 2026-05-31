import { useState } from 'react';
import ProductTable from '../../../components/admin/product/ProductTable';
import ProductForm from '../../../components/admin/product/ProductForm';
import ProdukDeleteModal from '../../../components/admin/product/ProdukDeleteModal';

export default function ProdukPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleSubmit = (form) => {
    if (!form) {
      setSelectedProduct(null);
      return;
    }
    if (selectedProduct) {
      setProducts(products.map(p =>
        p.id === selectedProduct.id ? { ...form, id: selectedProduct.id } : p
      ));
    } else {
      setProducts([...products, { ...form, id: Date.now() }]);
    }
    setSelectedProduct(null);
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#08090c' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            margin: '0 0 4px',
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}>
            Manage Produk
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Kelola produk yang tersedia di toko
          </p>
        </div>

        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
        />

        <ProductTable
          products={products}
          onEdit={(product) => setSelectedProduct(product)}
          onDelete={(product) => setProductToDelete(product)}
        />

        <ProdukDeleteModal
          product={productToDelete}
          onConfirm={() => {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setProductToDelete(null);
          }}
          onCancel={() => setProductToDelete(null)}
        />
      </div>
    </div>
  );
}