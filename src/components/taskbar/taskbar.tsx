'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/app/lib/utils';

import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { focusApp, getAppsState, getFocusedAppId, toggleMinimizeApp } from '@/redux/appSlice';
import StartMenu from '@/components/taskbar/startMenu';


interface TaskbarProps {
    theme: string;
    startMenuVisible: boolean;
    toggleStartMenu: () => void;
}

interface AppState {
    id: number;
    label: string;
    path: string;
    x: number;
    y: number;
    open: boolean;
    minimized: boolean;
    fullSize: boolean;
}

const Taskbar: React.FC<TaskbarProps> = ({ theme, startMenuVisible, toggleStartMenu }) => {
    const [isMute, setIsMute] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const dispatch = useDispatch();
    const apps: { [key: string]: AppState } = useSelector(getAppsState);
    const focusedAppId = useSelector(getFocusedAppId);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleToggleApp = (id: string) => {
        if (apps[id].minimized) {
            dispatch(
                toggleMinimizeApp({
                    id: Number(id),
                })
            );
        }
        dispatch(
            focusApp({
                id: Number(id),
            })
        );
    };

    const handleTaskbarClick = () => {
        toggleStartMenu();
    };

    return (
        <div
            style={{
                zIndex: 1000,
            }}
            className={`text-center text-white flex flex-row justify-between items-center`}>
            <button onClick={handleTaskbarClick}>
                <Image
                    src="/xp/windowsXP_taskbar_start.webp"
                    alt="windowsXP taskbar"
                    width={100}
                    height={100}
                    className="z-105 w-[120px] cursor-pointer hover:brightness-110"
                />
            </button>
            <div className={'bg-taskbar-gradient w-full h-[30px] ml-[-3px] z-5 ' + 'border border-xp-taskbar '}>
                <div className={'flex ml-2 gap-[1.7px] mt-[5px] cursor-pointer'}>
                    {Object.keys(apps).map((id, index) => {
                        return (
                            <div
                                key={index}
                                className={cn(
                                    `pl-2 flex items-center gap-2 bg-xp-taskbar-unselected w-[170px] h-[21px] xp-taskbar-apps-unselected text-[0.8rem] hover:brightness-110`,
                                    {
                                        'bg-xp-taskbar-selected': Number(id) === focusedAppId,
                                        'xp-taskbar-apps-selected': Number(id) === focusedAppId,
                                        'hover:brightness-150': Number(id) === focusedAppId,
                                    }
                                )}
                                onClick={() => handleToggleApp(id)}>
                                <Image
                                    src={apps[id].path}
                                    alt="windowsXP taskbar"
                                    width={20}
                                    height={18}
                                    className=""
                                />
                                <h3>{apps[id].label}</h3>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div
                className={
                    'bg-taskbar-setting-gradient h-[30px] w-[150px] border border-xp-taskbar_setting ' +
                    'flex flex-wrap justify-start items-center'
                }>
                <Image
                    src={isMute ? '/xp/indicatorIcons/xp_speaker_mute.webp' : '/xp/indicatorIcons/xp_speaker.webp'}
                    alt={'windowsXP speaker icon'}
                    width={200}
                    height={400}
                    className={'w-[30px] mt-[1px] cursor-pointer hover:brightness-110 z-2'}
                    onClick={() => setIsMute((prev) => !prev)}
                />
                <Image
                    src={'/xp/indicatorIcons/xp_security_error.webp'}
                    alt={'windowsXP security risk awareness icon'}
                    width={200}
                    height={400}
                    className={'w-5 h-5 cursor-pointer hover:brightness-110 z-5'}
                />
                <h3 className={'ml-auto mr-1 text-center text-[0.7rem]'}>{formatTime(currentTime)}</h3>
            </div>
            {startMenuVisible && <StartMenu />}
        </div>
    );
};

export default Taskbar;