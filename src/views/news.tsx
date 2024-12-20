import React, { useEffect, useState } from "react";
// Mi permette di usare le prop
import { useParams, useNavigate } from "react-router-dom";

interface NewsItem {
	gid: string;
	title: string;
	url: string;
	author: string;
	contents: string;
	name: string;
	appid: number;
	date: number;
}

const GameNews = () => {
	const { appid, name } = useParams<{ appid: string; name: string }>(); //Prende appid per aprire le news specifichi e il name per il nome appunto
	const [news, setNews] = useState<NewsItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true); // Stato di caricamento
	const [currentPage, setCurrentPage] = useState(1);
	const NewsPerPage = 10;
	const navigate = useNavigate();

	useEffect(() => {
		document.title = `Notizie di ${name}`;

		const fetchNewsForGame = async () => {
			setLoading(true); // Inizia il caricamento

			try {
				const response = await fetch(
					`/api/ISteamNews/GetNewsForApp/v0002/?appid=${appid}&count=100&maxlength=300&format=json`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				console.log(data);
				setNews(data.appnews.newsitems);
				setError(null); // Resetta l'errore se i dati vengono recuperati correttamente
			} catch (error) {
				setError(
					(error as Error).message || "Errore durante il recupero delle notizie"
				);
				setNews([]); // Resetta le notizie se c'è un errore
			} finally {
				setLoading(false); // Caricamento terminato
			}
		};

		fetchNewsForGame();
	}, [appid]);

	const extractImageUrl = (contents: string): string => {
		const regex =
			/{STEAM_CLAN_IMAGE}\/(\d+)\/([a-zA-Z0-9]+\.png|[a-zA-Z0-9]+\.jpg|[a-zA-Z0-9]+\.jpeg|[a-zA-Z0-9]+\.webp)/;
		const match = contents.match(regex);

		if (match) {
			return `https://clan.fastly.steamstatic.com/images/${match[1]}/${match[2]}`;
		} else {
			return "https://www.lffl.org/wp-content/uploads/2022/02/valve-proton.jpg";
		}
	};

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		return date.toLocaleDateString("it-IT", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDatePatchNotes = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		return date.toLocaleDateString("it-IT", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
	};

	const totalPages = Math.ceil(news.length / NewsPerPage);
	const currentNews = news.slice(
		(currentPage - 1) * NewsPerPage,
		currentPage * NewsPerPage
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className="lg:container mx-auto pt-8">
			{/* Freccia per tornare indietro */}
			<div className="flex gap-4">
				<button
					onClick={() => navigate(-1)}
					className="mb-4 px-4 py-2 border text-white rounded border-0 back-shadow"
				>
					<i className="fa-solid fa-arrow-left"></i>
				</button>
				<h1 className="pb-4 font-bold">Notizie di: {name}</h1>
			</div>

			{loading ? (
				<div>
					<h1>Caricamento delle notizie in corso...</h1>{" "}
					{/* Indica che i dati stanno arrivando */}
				</div>
			) : error ? (
				<div>
					<h1>Errore 404</h1>
					<h1>{error}</h1> {/* Mostra il messaggio di errore */}
				</div>
			) : news.length === 0 ? (
				<div>
					<h1>Ops. Nessuna notizia disponibile per questo gioco.</h1>
				</div>
			) : (
				<div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
					{currentNews.map((newsItem, index) => {
						const imageUrl = extractImageUrl(newsItem.contents);
						const formattedDate = formatDate(newsItem.date);
						const formattedDatePatchNotes = formatDatePatchNotes(newsItem.date);

						return (
							<div key={index} className="flex flex-col mb-4">
								{newsItem.title === "Team Fortress 2 Update Released" ? (
									<div className="flex">
										<h3 className="font-bold flex-1">{newsItem.title}</h3>
										<h3 className="ms-2 font-bold">
											{formattedDatePatchNotes}
										</h3>
									</div>
								) : (
									<h3 className="font-bold flex-1">{newsItem.title}</h3>
								)}

								<a
									onClick={() => window.open(`${newsItem.url}`, `_blank`)}
									className="text-blue-500 hover:underline cursor-pointer hover:no-underline"
								>
									Per saperne di più
								</a>

								<a
									href={`${newsItem.url}`}
									className="text-blue-500 hover:underline block"
								>
									<img src={imageUrl} alt={newsItem.title} className="mt-2 " />
								</a>
								<p className="">Autore: {newsItem.author || "N/A"}</p>
								<p className="text-sm text-gray-500">Data: {formattedDate}</p>
							</div>
						);
					})}
				</div>
			)}

			<div className="flex justify-center mt-4 pb-8 lg:container mx-auto overflow-hidden">
				{Array.from({ length: totalPages }, (_, index) => (
					<button
						key={index + 1}
						className={`px-4 py-2 mx-1 border ${
							index + 1 === currentPage
								? "bg-gray-800 text-white"
								: "bg-white text-gray-800"
						}`}
						onClick={() => setCurrentPage(index + 1)}
					>
						{index + 1}
					</button>
				))}
			</div>
		</div>
	);
};

export default GameNews;
