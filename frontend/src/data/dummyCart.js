/**
 * dummyCart.js
 * -----------
 * Data dummy untuk keranjang belanja Siber Merch.
 * Setiap objek merepresentasikan satu item di cart.
 *
 * Atribut:
 *  - id       : identifier unik tiap item
 *  - name     : nama produk
 *  - size     : ukuran kaos / merchandise
 *  - price    : harga satuan dalam Rupiah (angka)
 *  - quantity : jumlah item yang dipesan
 *  - image    : URL gambar produk (pakai placeholder via picsum.photos)
 * 
 */

import artikel1 from '../assets/artikel1.jpeg';
import artikel2 from '../assets/artikel2.jpeg';
import artikel3 from '../assets/artikel3.jpeg';


const dummyCart = [
  {
    id: 1,
    name: "Kaos Sibermerch artkel 1",
    size: "L",
    price: 75000,
    quantity: 2,
    image: artikel1,
  },
  {
    id: 2,
    name: "Kaos Sibermerch artikel 2",
    size: "M",
    price: 75000,
    quantity: 1,
    image: artikel2,
  },
  {
    id: 3,
    name: "Kaos Sibermerch artikel 3",
    size: "One Size",
    price: 75000,
    quantity: 3,
    image: artikel3,
  },
];

export default dummyCart;
