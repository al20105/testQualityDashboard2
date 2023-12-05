import { FolderIcon } from '@heroicons/react/24/outline'

const navigation = [
    { name: 'お仕事開始', href: '/broadcast', icon: FolderIcon, current: false },
    { name: 'プロフィール編集', href: '/users/profiles/userId', icon: FolderIcon, current: false }, // TODO: "userId"の部分に自身のユーザーIDを渡せるように修正(同時に名前付きルートにできるとGood)
    { name: '履歴', href: '#', icon: FolderIcon, current: false },
    { name: '設定', href: '#', icon: FolderIcon, current: false },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}

            {/* bottom tab */}
            <div className='fixed bottom-2 w-full max-w-md'>
                <div className='w-full flex'>
                    {navigation.map((item) => (
                        <div className='flex-1' key={item.name}>
                            <a
                                href={item.href}
                                className={classNames(
                                    item.current
                                        ? 'text-pink-600'
                                        : 'text-neutral-700 hover:text-pink-600',
                                    'flex flex-col items-center text-sm leading-6'
                                )}
                            >
                                <item.icon
                                    className={classNames(
                                        item.current ? 'text-pink-600' : 'group-hover:text-pink-600',
                                        'h-7'
                                    )}
                                    aria-hidden="true"
                                />
                                <p className='text-xs font-semibold'>{item.name}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}