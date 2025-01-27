interface Seller {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  profilePicture: string | null;
}

interface BookWithSeller {
  title: string;
  description: string;
  stock: number;
  price: number;
  seller: Seller;
}

export interface CartItemResponse {
  id: string;
  cartId: string;
  bookId: string;
  priceAtCart: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  book: BookWithSeller;
}
