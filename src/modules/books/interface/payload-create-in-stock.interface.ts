import EGenre from '../enum/genre.enum'

export interface PayloadCreateInStockInterface {
  title: string

  descr: string

  author: string

  genre: EGenre

  price: number

  publisher: string

  quantity: number

  imageUrl: string
}
