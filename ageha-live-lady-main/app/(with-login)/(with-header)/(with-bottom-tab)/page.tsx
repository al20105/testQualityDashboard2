import Image from "next/image"
import Link from "next/link"
import Styles from "./page.module.css"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  return (
    <main className="py-4">
      <div
        className={classNames(Styles.profileWrapper, "max-w-md")}
      >
        <div 
          className={classNames(Styles.profileInner, "relative aspect-[1/1]")}
        >
          <Image 
            fill 
            objectFit="cover" 
            src="/images/hirose_suzu.jpeg" 
            alt="" 
            className={
              classNames(
                Styles.profileImage,
                "pointer-events-none object-cover group-hover:opacity-75"
              )
            }
          />
        </div>

        <div
          className={classNames(Styles.profileDetailWrapper)}
        >
          <div
            className={classNames(Styles.profileDetailInner)}
          >
            <h5>名前：{"お名前太郎"}</h5>
            <h5>獲得ポイント：{"12000"}Pt</h5>
          </div>
        </div>

        <Link href="/broadcast">
          <div
            className={classNames(Styles.prepareBtn,
              "mt-2 w-80 py-2 bg-pink-500 rounded-full m-auto")}
          >
            <div className="flex justify-center items-center">
              <svg className="text-white" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.413-.588T2 18V6q0-.825.588-1.413T4 4h12q.825 0 1.413.588T18 6v4.5l4-4v11l-4-4V18q0 .825-.588 1.413T16 20H4Z" /></svg>
              <span className="ml-2 text-white font-bold">配信準備へ進む</span>
            </div>
          </div>
        </Link>
      </div>

    </main>
  )
}
