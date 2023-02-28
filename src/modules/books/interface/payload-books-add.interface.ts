import EGenre from '../enum/genre.enum'

export interface PayloadBooksAddInterface {
  title: string

  descr: string

  author: string

  genre: EGenre

  price: number

  publisher: string

  imageUrl: string
}
