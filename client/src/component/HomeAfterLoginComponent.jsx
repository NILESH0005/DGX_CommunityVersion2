import React, { useState, useEffect } from 'react';
import quotes from '../json/quotes.json'

import { IoCloudUpload } from "react-icons/io5";
import { FaLock } from "react-icons/fa6";
import { RiCalendarEventFill } from "react-icons/ri";

// import { images } from '../constant';



const HomeAfterLoginComponent = () => {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState("");
    const [loading, setLoading] = useState(true);
    

    const images = [
        'https://i.imgur.com/FFQKx5h.jpeg',
        'https://i.imgur.com/8Iy60sf.png',
        'https://i.imgur.com/7AubC7P.png',

    ];

    const stats = [
        { id: 1, name: 'Transactions every 24 hours', value: '44 million' },
        { id: 2, name: 'Assets under holding', value: '$119 trillion' },
        { id: 3, name: 'New users annually', value: '46,000' },
    ]
    


    const [currentSlide, setCurrentSlide] = useState(0);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };
    // Function to get a random quote
    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length); // Get a random index
        return quotes[randomIndex];
    };

    // Set quote when component mounts
    useEffect(() => {
        const randomQuote = getRandomQuote(); // Get a random quote on component load
        setQuote(randomQuote.quote);
        setAuthor(randomQuote.author);
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {/* Welcome Section
            <section className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <div className="mt-4 flex gap-4">
                    <a href="/discussion" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                        Start Discussion
                    </a>
                    <a href="/EventWorkshopPage" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                        Join Event
                    </a>
                    <a href="/blog" className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                        Blog
                    </a>
                </div>

            </section> */}

            {/* Dashboard Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Quote of the Day */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mt-6">
                        <h2 className="text-xl font-bold  text-DGXblue">Quote of the Day:</h2>
                        <blockquote className="italic font-semibold font-mono mt-4 text-DGXgreen">"{quote}"</blockquote>
                        <p className="mt-2 font-mono text-right text-DGXblue">- <span className='underline'>{author}</span></p>
                    </div>
                </div>
                
                {/* Upcoming Events */}
                
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-700 font-medium">Event 1: AI Workshop</p>
                                <p className="text-gray-500 text-sm">Dec 1, 2024 | 10:00 AM</p>
                            </div>
                            <button className="text-blue-600 font-medium hover:underline">View</button>
                        </li>
                        <li className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-700 font-medium">Event 2: Community Meetup</p>
                                <p className="text-gray-500 text-sm">Dec 5, 2024 | 3:00 PM</p>
                            </div>
                            <button className="text-blue-600 font-medium hover:underline">View</button>
                        </li>
                    </ul>
                </div>

            </section>

            <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <svg
                        aria-hidden="true"
                        className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
                    >
                        <defs>
                            <pattern
                                x="50%"
                                y={-1}
                                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                                width={200}
                                height={200}
                                patternUnits="userSpaceOnUse"
                            >
                                <path d="M100 200V.5M.5 .5H200" fill="none" />
                            </pattern>
                        </defs>
                        <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
                            <path
                                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                                strokeWidth={0}
                            />
                        </svg>
                        <rect fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" width="100%" height="100%" strokeWidth={0} />
                    </svg>
                </div>
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="lg:max-w-lg">
                                <p className="text-base font-semibold leading-7 text-indigo-600">Explore What&apos;s Next in AI With the Best of NVIDIA DGX</p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Artificial Intelligence</h1>
                                <p className="mt-6 text-xl leading-8 text-gray-700">
                                    Aliquet nec orci mattis amet quisque ullamcorper neque, nibh sem. At arcu, sit dui mi, nibh dui, diam
                                    eget aliquam. Quisque id at vitae feugiat egestas.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center lg:p-10 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
                        <div className="relative w-full overflow-hidden">
                            <div
                                className="flex transition-transform duration-500"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {images.map((img, index) => (
                                    <div key={index} className="flex-shrink-0 w-full">
                                        <img
                                            src={img}
                                            alt={`Slide ${index}`}
                                            className="w-full h-auto rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={prevSlide}
                                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full z-10"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full z-10"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>


                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg">
                                <p>
                                    Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris semper sed amet
                                    vitae sed turpis id. Id dolor praesent donec est. Odio penatibus risus viverra tellus varius sit neque
                                    erat velit. Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris
                                    semper sed amet vitae sed turpis id.
                                </p>
                                <ul role="list" className="mt-8 space-y-8 text-gray-600">
                                    <li className="flex gap-x-3">
                                        <IoCloudUpload aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-indigo-600" />
                                        <span>
                                            <strong className="font-semibold text-gray-900">Push to deploy.</strong> Lorem ipsum, dolor sit amet
                                            consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate
                                            blanditiis ratione.
                                        </span>
                                    </li>
                                    <li className="flex gap-x-3">
                                        <FaLock aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-indigo-600" />
                                        <span>
                                            <strong className="font-semibold text-gray-900">SSL certificates.</strong> Anim aute id magna aliqua
                                            ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
                                        </span>
                                    </li>
                                    <li className="flex gap-x-3">
                                        <RiCalendarEventFill aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-indigo-600" />
                                        <span>
                                            <strong className="font-semibold text-gray-900">Database backups.</strong> Ac tincidunt sapien
                                            vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.
                                        </span>
                                    </li>
                                </ul>
                                <p className="mt-8">
                                    Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis odio id et. Id blandit molestie auctor
                                    fermentum dignissim. Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate et ultrices hac
                                    adipiscing egestas. Iaculis convallis ac tempor et ut. Ac lorem vel integer orci.
                                </p>
                                <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">No server? No problem.</h2>
                                <p className="mt-6">
                                    Id orci tellus laoreet id ac. Dolor, aenean leo, ac etiam consequat in. Convallis arcu ipsum urna nibh.
                                    Pharetra, euismod vitae interdum mauris enim, consequat vulputate nibh. Maecenas pellentesque id sed
                                    tellus mauris, ultrices mauris. Tincidunt enim cursus ridiculus mi. Pellentesque nam sed nullam sed diam
                                    turpis ipsum eu a sed convallis diam.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        {stats.map((stat) => (
                            <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                    {stat.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>



            <section className="bg-white dark:bg-gray-900">
                <div className="container px-6 py-10 mx-auto">
                    <h1 className="text-2xl font-semibold text-gray-800 capitalize lg:text-3xl dark:text-white">From the blog</h1>

                    <div className="grid grid-cols-1 gap-8 mt-8 md:mt-16 md:grid-cols-2">
                        <div className="lg:flex">
                            <img className="object-cover w-full h-56 rounded-lg lg:w-64" src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="" />

                            <div className="flex flex-col justify-between py-6 lg:mx-6">
                                <a href="#" className="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                    How to use sticky note for problem solving
                                </a>

                                <span className="text-sm text-gray-500 dark:text-gray-300">On: 20 October 2019</span>
                            </div>
                        </div>

                        <div className="lg:flex">
                            <img className="object-cover w-full h-56 rounded-lg lg:w-64" src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="" />

                            <div className="flex flex-col justify-between py-6 lg:mx-6">
                                <a href="#" className="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                    How to use sticky note for problem solving
                                </a>

                                <span className="text-sm text-gray-500 dark:text-gray-300">On: 20 October 2019</span>
                            </div>
                        </div>

                        <div className="lg:flex">
                            <img className="object-cover w-full h-56 rounded-lg lg:w-64" src="https://images.unsplash.com/photo-1544654803-b69140b285a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="" />

                            <div className="flex flex-col justify-between py-6 lg:mx-6">
                                <a href="#" className="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                    Morning routine to boost your mood
                                </a>

                                <span className="text-sm text-gray-500 dark:text-gray-300">On: 25 November 2020</span>
                            </div>
                        </div>

                        <div className="lg:flex">
                            <img className="object-cover w-full h-56 rounded-lg lg:w-64" src="https://images.unsplash.com/photo-1530099486328-e021101a494a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1547&q=80" alt="" />

                            <div className="flex flex-col justify-between py-6 lg:mx-6">
                                <a href="#" className="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                    All the features you want to know
                                </a>

                                <span className="text-sm text-gray-500 dark:text-gray-300">On: 30 September 2020</span>
                            </div>
                        </div>

                        <div className="lg:flex">
                            <img className="object-cover w-full h-56 rounded-lg lg:w-64" src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1484&q=80" alt="" />

                            <div className="flex flex-col justify-between py-6 lg:mx-6">
                                <a href="#" className="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                    Minimal workspace for your inspirations
                                </a>

                                <span className="text-sm text-gray-500 dark:text-gray-300">On: 13 October 2019</span>
                            </div>
                        </div>

                        <div className="lg:flex">
                            <img className="object-cover w-full h-56 rounded-lg lg:w-64" src="https://images.unsplash.com/photo-1624996379697-f01d168b1a52?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="" />

                            <div className="flex flex-col justify-between py-6 lg:mx-6">
                                <a href="#" className="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                    What do you want to know about Blockchane
                                </a>

                                <span className="text-sm text-gray-500 dark:text-gray-300">On: 20 October 2019</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HomeAfterLoginComponent

