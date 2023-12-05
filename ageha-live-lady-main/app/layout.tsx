import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Styles from './layout.module.css'

const inter = Inter({ subsets: ['latin'] })

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const metadata: Metadata = {
  title: 'AGEHAライブチャット お仕事ページ',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={classNames(inter.className, "h-full")} >
      <body className={classNames(inter.className, "")}>
        <div className={classNames(Styles.bodyWrapper)}>
          <Providers>
            <div className='max-w-md mx-auto'>
              {children}
            </div>
          </Providers>
        </div>
      </body>
    </html>
  )
}
