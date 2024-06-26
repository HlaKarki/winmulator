'use client';

import { Lora, Pixelify_Sans } from 'next/font/google';
import { SubmitHandler, useForm } from 'react-hook-form';
import { cn } from '../lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { createFloppyData, readFloppyData, readTopFloppyData } from '../lib/actions';
import { FloppyData, FloppyDataFields, FloppyDataFormFields } from '../lib/types';
const lora = Lora({ subsets: ['latin'] });
const pixelify_sans = Pixelify_Sans({ subsets: ['latin'] });

export function FileUploadModal({ onClick }: { onClick: () => void }) {
    const { register, handleSubmit, formState, reset } = useForm<FloppyDataFormFields>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileSize, setFileSize] = useState<number>(-1);
    const [fileName, setFileName] = useState<string>('');
    const [hasFlie, setHasFile] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const onSubmit: SubmitHandler<FloppyDataFormFields> = async (data) => {
        const { username, email, filename, desc } = data;
        const input: FloppyDataFields = {
            username: username,
            email: email,
            filename: filename.length == 0 ? fileName : filename,
            desc: desc,
            filesize: fileSize,
            disknum: calculateFloppyDisk(fileSize),
        };

        try {
            await createFloppyData(input);
        } catch (error) {
            console.error(error);
            setIsError(true);
        } finally {
            setIsSuccess(true);
        }
    };

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset({ username: '', email: '', filename: '', desc: '' });
        }
    }, [formState]);

    const renderForm = () => {
        return (
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col p-3 gap-1 bg-[#FFCC33] border-4 border-[#9C0000] w-full">
                <h1 className="text-[#9C0000] font-bold text-2xl mb-3">Leave your record!</h1>
                <input
                    className="py-1 px-2 border-[3px] border-[#9C0000]"
                    {...register('username')}
                    type="text"
                    required
                    placeholder="Your username"
                />
                <input
                    className="py-1 px-2 border-[3px] border-[#9C0000]"
                    {...register('email')}
                    type="email"
                    required
                    placeholder="Your email"
                />
                <input
                    className="py-1 px-2 border-[3px] border-[#9C0000]"
                    {...register('filename')}
                    type="text"
                    placeholder="Edit your filename (Default: Your original filename)"
                />
                <input
                    className="py-1 px-2 border-[3px] border-[#9C0000]"
                    {...register('desc')}
                    type="text"
                    placeholder="Description..."
                />
                <button type="submit" className="animate-rainbow bg-gray-400 mt-4 py-3 border-4 border-black">
                    Submit!
                </button>
                {isError && <div className="text-center text-[#9C0000]">Something went wrong. Try again!</div>}
                {isSuccess && <div className="text-center text-[#06d703]">Submitted!</div>}
            </form>
        );
    };

    const handleEventBubbling = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setFileSize(file.size);
            setHasFile(true);
        }
    };

    const calculateFloppyDisk = (size: number) => {
        return Math.ceil(size / 4000);
    };
    return (
        <section className="w-full justify-center flex flex-col items-center gap-3" onClick={handleEventBubbling}>
            <article className="bg-white border-4 border-[#9C0000] flex flex-col justify-center items-center p-2 w-[40%] min-w-[200px]">
                <div>Our Policy</div>
                <section className={cn(pixelify_sans.className, 'border-2 border-t-black border-l-black bg-white m-1')}>
                    <div className="overflow-y-auto leading-4 text-left mb-3 max-h-[150px]">
                        By uploading your file, you agree with our policy. Our policy is nothing. Just enjoy this
                        website. We are just gonna take the size of your file cuz it is super expensive to store your
                        file into our database server. What if the user uploads Baldur&lsquo;s Gate 3? Then we are
                        screwed up....So don&lsquo;t worry about that....
                    </div>
                </section>
                <div className="space-x-2">
                    <button
                        className="border-2 border-t-white border-l-white border-r-black border-b-black px-2 active:bg-[#b5b5b5] bg-[#CCCCCC]"
                        onClick={handleButtonClick}>
                        Browse the files
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                    <button
                        className="border-2 border-t-white border-l-white border-r-black border-b-black px-2 active:bg-[#b5b5b5] bg-[#CCCCCC]"
                        onClick={onClick}>
                        Cancel
                    </button>
                </div>
            </article>
            {hasFlie && (
                <div className="bg-[#dff6dd] border-4 border-[#4ccf43] py-2 px-4">
                    Your file is {fileName} with{' '}
                    <span className="text-[#9C0000] font-semibold italic"> {calculateFloppyDisk(fileSize)}</span> floppy
                    disks!
                </div>
            )}
            {hasFlie && renderForm()}
        </section>
    );
}

export function LeaderBoard() {
    const [topUser, setTopUser] = useState<FloppyData>();
    const [data, setData] = useState<FloppyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await readTopFloppyData();
                const data = await readFloppyData();
                if (!result) {
                    throw new Error('Network response was not ok');
                }
                if (!data) {
                    throw new Error('Network response was not ok');
                }
                setTopUser(result);
                setData(data);
                console.log(data);
            } catch (error) {
                setError('ERROR!');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error</div>;
    }

    return (
        <div className="w-full">
            <h1 className="font-semibold my-3">++ Leaderboard ++</h1>
            <div className="mb-3">
                <div className="font-bold animate-rainbow">Top user: {topUser?.username}</div>
                <div className="font-bold">{topUser?.disknum} floppy disks.</div>
                <div className="text-sm">
                    &#40;Submission: {topUser?.filename} with {topUser?.filesize} Bytes&#41;
                </div>
            </div>
            <div className="border-4 border-[#9C0000] bg-white flex flex-col justify-center items-center">
                <div className="bg-[#9C0000] p-2 font-bold text-white w-full">Ranking</div>
                <table className="self-center text-center w-full">
                    <tr className="w-full max-md:text-xs">
                        <th>#</th>
                        <th>Username</th>
                        <th># Disk</th>
                        <th>Filename</th>
                        <th>Description</th>
                        <th>Filesize</th>
                    </tr>
                    {data.map((d, i) => {
                        return (
                            <tr key={i} className="bg-slate-100 w-full max-md:text-xs">
                                <td>{i + 1}</td>
                                <td>{d.username}</td>
                                <td>{d.disknum}</td>
                                <td>{d.filename}</td>
                                <td>{d.desc}</td>
                                <td>{d.filesize}</td>
                            </tr>
                        );
                    })}
                </table>
            </div>
        </div>
    );
}

export function FloppyDiskProgramWin2000WinXP() {
    const [isFileToggle, setIsFileToggle] = useState<boolean>(false);
    const [isBoardToggle, setIsBoardToggle] = useState<boolean>(false);

    const handleFileToggle = () => {
        setIsFileToggle(true);
        setIsBoardToggle(false);
    };

    const handleCancelToggle = () => {
        setIsFileToggle(false);
        setIsBoardToggle(false);
    };

    return (
        <main className={cn(lora.className, 'min-h-[100%] w-full bg-[#CCCCCC] text-center select-none pb-6')}>
            <header className="text-[calc(3.5vw+1rem)] py-4" style={{ textShadow: '5px 5px #5539C1' }}>
                Floppy Disk Online Convertor
            </header>
            <div
                className="bg-gradient-to-r from-transparent via-[#5539C1] to-transparent py-1 text-xl text-white animate-rainbow px-5"
                style={{ textShadow: '#FFF 1px 0 10pxe' }}>
                Welcome to disk online convertor
            </div>
            <div className="p-4">This website is for creating a lot of 4KB chunks from your uploaded file.</div>
            <div className="pb-4">
                Contributors:{' '}
                <Link href="https://imgyeong.vercel.app/" className="text-[#2626ff] underline underline-offset-4">
                    @Imgyeong
                </Link>{' '}
                <Link href="https://hlakarki.vercel.app/" className="text-[#2626ff] underline underline-offset-4">
                    @Hla
                </Link>
            </div>
            <section className="px-6">
                <article className="bg-[#c0e6bd] border-4 border-[#4ccf43] p-4 max-md:p-1 flex flex-col justify-center items-center">
                    <div className="text-red-700 text-2xl font-bold pb-3">&#8902; Menu &#8902;</div>
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex flex-col md:flex-row gap-1 items-center justify-center">
                            <button
                                className="border-2 border-t-white border-l-white border-r-black border-b-black px-2 active:bg-[#b5b5b5] bg-[#CCCCCC]"
                                onClick={handleFileToggle}>
                                Upload File
                            </button>
                            <div className="text-sm">Upload your file and get a lot of floppy disks!</div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-1 items-center justify-center">
                            <button
                                className="border-2 border-t-white border-l-white border-r-black border-b-black px-2 active:bg-[#b5b5b5] bg-[#CCCCCC]"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsFileToggle(false);
                                    setIsBoardToggle(true);
                                }}>
                                Leaderboard
                            </button>
                            <div className="text-sm">Look around other submissions!</div>
                        </div>
                    </div>
                    {isFileToggle && <FileUploadModal onClick={handleCancelToggle} />}
                    {isBoardToggle && <LeaderBoard />}
                </article>
            </section>
            <footer className="text-xs py-7">&copy; 2024 Hla Htun and Imgyeong Lee. All rights reserved.</footer>
        </main>
    );
}

export function FloppyDiskProgramWin7() {
    const [isFileToggle, setIsFileToggle] = useState<boolean>(false);
    const [isBoardToggle, setIsBoardToggle] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('Home');

    return (
        <main className="md:p-4 p-1 w-full min-h-[100%] select-none">
            <header className="text-[calc(1vw+1rem)] font-bold text-[#4F4F4F] italic mb-3">
                Floppy Disk Online Convertor
            </header>
            <nav className="bg-[#F4F4F4] w-full py-1 px-3 md:space-x-6 mb-3 md:text-base text-sm space-x-3">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsBoardToggle(false);
                        setIsFileToggle(false);
                        setTitle('Home');
                    }}>
                    Home
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsBoardToggle(true);
                        setIsFileToggle(false);
                        setTitle('Leaderboard');
                    }}>
                    Leaderboard
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsBoardToggle(false);
                        setIsFileToggle(true);
                        setTitle('Upload');
                    }}>
                    Upload
                </button>
            </nav>
            <div className="text-white bg-[#0976B3] py-1 px-3 text-xl italic font-semibold">{title}</div>
            {!isBoardToggle && !isFileToggle && <FloppyHomeWin7 />}
            {isFileToggle && <FloppyUploadWin7 />}
            {isBoardToggle && <FloppyLeaderBoardWin7 />}
        </main>
    );
}

export function FloppyHomeWin7() {
    const [topUser, setTopUser] = useState<FloppyData>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await readTopFloppyData();
                if (!result) {
                    throw new Error('Network response was not ok');
                }
                setTopUser(result);
            } catch (error) {
                setError('ERROR!');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error</div>;
    }

    return (
        <div className="flex flex-col md:grid-cols-3 md:grid mt-3 gap-3">
            <div className="md:col-span-2 bg-slate-100 p-4 flex flex-col lg:flex-row items-center">
                <Image src="/floppy_disk.webp" alt="disk" width={500} height={500} />
                <div className="p-4">
                    <div className="font-semibold text-2xl">About floppy disk</div>
                    <div className="leading-tight mt-2">
                        A floppy disk or floppy diskette is a type of disk storage composed of a thin and flexible disk
                        of a magnetic storage medium in a square or nearly square plastic enclosure lined with a fabric
                        that removes dust particles from the spinning disk.
                    </div>
                    <div className="leading-tight mt-2">
                        You cannot but the disks here, but at least you can see our portfolios. Check these out!
                    </div>
                    <Link href="https://imgyeong.vercel.app/" className="text-[#2626ff] underline underline-offset-4">
                        @Imgyeong
                    </Link>{' '}
                    <Link href="https://hlakarki.vercel.app/" className="text-[#2626ff] underline underline-offset-4">
                        @Hla
                    </Link>
                </div>
            </div>
            <div className="p-4 bg-hiring bg-cover bg-center h-full w-full min-h-[500px] self-center"></div>
            <div className="md:col-span-3 bg-slate-300 p-4 font-bold">
                Current Top User: {topUser?.username} with {topUser?.disknum} disks!
            </div>
        </div>
    );
}

export function FloppyLeaderBoardWin7() {
    const [topUser, setTopUser] = useState<FloppyData>();
    const [data, setData] = useState<FloppyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await readTopFloppyData();
                const data = await readFloppyData();
                if (!result) {
                    throw new Error('Network response was not ok');
                }
                if (!data) {
                    throw new Error('Network response was not ok');
                }
                setTopUser(result);
                setData(data);
            } catch (error) {
                setError('ERROR!');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error</div>;
    }
    return (
        <div className="w-full">
            <div className="my-3 text-center">
                <div className="font-bold">
                    Top user: {topUser?.username} with {topUser?.disknum} floppy disks.
                </div>
                <div className="text-sm">
                    &#40;Submission: {topUser?.filename} {topUser?.filesize} Bytes&#41;
                </div>
            </div>
            <div className="border-2 border-slate-300 bg-white flex flex-col justify-center items-center">
                <div className="bg-slate-300 p-2 font-bold text-black w-full text-center">Ranking</div>
                <table className="self-center text-center w-full">
                    <tr className="w-full max-md:text-xs">
                        <th>Username</th>
                        <th># Disk</th>
                        <th>Filename</th>
                        <th>Filesize</th>
                    </tr>
                    {data.map((d, i) => {
                        return (
                            <tr key={i} className="bg-slate-100 w-full max-md:text-xs">
                                <td>{d.username}</td>
                                <td>{d.disknum}</td>
                                <td>{d.filename}</td>
                                <td>{d.filesize}</td>
                            </tr>
                        );
                    })}
                </table>
            </div>
        </div>
    );
}

export function FloppyUploadWin7() {
    const { register, handleSubmit, formState, reset } = useForm<FloppyDataFormFields>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileSize, setFileSize] = useState<number>(-1);
    const [fileName, setFileName] = useState<string>('');
    const [hasFile, setHasFile] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const onSubmit: SubmitHandler<FloppyDataFormFields> = async (data) => {
        const { username, email, filename, desc } = data;
        const input: FloppyDataFields = {
            username: username,
            email: email,
            filename: filename.length == 0 ? fileName : filename,
            desc: desc,
            filesize: fileSize,
            disknum: calculateFloppyDisk(fileSize),
        };

        try {
            await createFloppyData(input);
        } catch (error) {
            console.error(error);
            setIsError(true);
        } finally {
            setIsSuccess(true);
        }
    };

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset({ username: '', email: '', filename: '', desc: '' });
        }
    }, [formState]);

    const renderForm = () => {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-4 gap-1 bg-[#EAEAEA] w-[60%] mt-4">
                <h1 className="text-gray-950 font-bold text-2xl mt-3 text-center">Leave your record!</h1>
                <div className="text-gray-950 text-xs text-center mb-3">
                    Note: If you already have submitted your stuff, the submission will be updated.
                </div>
                <input
                    className="py-1 px-2 border border-slate-400 rounded"
                    {...register('username')}
                    type="text"
                    required
                    placeholder="Your username"
                />
                <input
                    className="py-1 px-2 border border-slate-400 rounded"
                    {...register('email')}
                    type="email"
                    required
                    placeholder="Your email"
                />
                <input
                    className="py-1 px-2 border border-slate-400 rounded"
                    {...register('filename')}
                    type="text"
                    placeholder="Edit your filename (Default: Your original filename)"
                />
                <input
                    className="py-1 px-2 border border-slate-400 rounded"
                    {...register('desc')}
                    type="text"
                    placeholder="Description..."
                />
                <button type="submit" className="win7-button mt-5">
                    Submit!
                </button>
                {isError && <div className="text-center text-[#9C0000] text-sm">Something went wrong. Try again!</div>}
                {isSuccess && <div className="text-center text-[#06d703] text-sm">Submitted!</div>}
            </form>
        );
    };

    const handleEventBubbling = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setFileSize(file.size);
            setHasFile(true);
        }
    };

    const calculateFloppyDisk = (size: number) => {
        return Math.ceil(size / 4000);
    };

    return (
        <div className="flex flex-col mt-3 gap-3">
            <div className="md:col-span-2 bg-[#EAEAEA] p-4">
                <div className="font-bold text-xl pb-2">What is this service for?</div>
                <div>
                    Upload your file and check how many floppy disks are needed to save it! You can upload the largest
                    file possible to set a record. Experience the evolution of technology!
                </div>
            </div>
            <div className="p-4 bg-[#F4F4F4] flex flex-col justify-center items-center">
                <div className="w-[50%] min-w-[250px]">
                    <div className="font-bold text-xl pb-2">Our Policy</div>
                    <div className="overflow-y-auto leading-5 text-left mb-5 max-h-[150px] p-2 bg-white border border-[#e4e4e4] rounded-md">
                        By uploading your file, you agree with our policy. Our policy is nothing. Just enjoy this
                        website. We are just gonna take the size of your file, cuz it is super expensive to store your
                        file into our database server. What if the user uploads Baldur&lsquo;s Gate 3? Then we are
                        screwed up.... So don&lsquo;t worry about that....
                    </div>
                </div>

                <div className="space-x-2" onClick={handleEventBubbling}>
                    <div>
                        <button className="win7-button" onClick={handleButtonClick}>
                            Browse the files
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
                {hasFile && (
                    <div className="text-xs mt-3">
                        Your file: {fileName} / Size: {calculateFloppyDisk(fileSize)} floppy disks &#40;{fileSize}{' '}
                        bytes&#41;
                    </div>
                )}
                {hasFile && renderForm()}
            </div>
        </div>
    );
}
