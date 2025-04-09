import { useEffect, useState } from "react";
import axios from "axios";

function LeaderboardPage({user}) {
    const [topLeaders, setTopLeaders] = useState([]);
    const [userPosition, setUserPosition] = useState(null);
    const [nearbyLeaders, setNearbyLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);

                // Запрос для получения топ-3 лидеров
                const topResponse = await axios.get(
                    "http://localhost:5000/api/leaderboard/top"
                );
                setTopLeaders(topResponse.data);

                // Запрос для получения позиции пользователя и соседних участников
                if (user) {
                    const nearbyResponse = await axios.get(
                        `http://localhost:5000/api/leaderboard/nearby?userId=${user.id}`
                    );
                    setUserPosition(nearbyResponse.data.userPosition);
                    setNearbyLeaders(nearbyResponse.data.nearbyUsers);
                }

                setError(null);
            } catch (err) {
                console.error("Ошибка при загрузке таблицы лидеров:", err);
                setError("Не удалось загрузить таблицу лидеров");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user]);

    if (loading) return <div className="card">Загрузка таблицы лидеров...</div>;
    if (error) return <div className="card error">{error}</div>;

    return (
        <div className="containe padding-left-right">
            <div className="card">
                <h2>Таблица лидеров</h2>

                {/* Топ-3 лидера */}
                <div className="leaderboard-top">
                    <h3>Топ-3 лидера</h3>
                    <ul>
                        {topLeaders.map((leader, index) => (
                            <li key={leader.id} className={`leader-card ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                                <span className="leader-position">{index + 1}</span>
                                <span className="leader-name">{leader.username}</span>
                                <span className="leader-score">{leader.total_score? leader.total_score : '0'} баллов</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Ближайшие участники */}
                {userPosition && (
                    <div className="leaderboard-nearby">
                        <h3>Ваше окружение</h3>
                        <ul>
                            {nearbyLeaders.map((leader) => (
                                <li
                                    key={leader.id}
                                    className={`leader-card ${leader.id === user.id ? 'current-user' : ''}`}
                                >
                                    <span className="leader-position">{leader.position}</span>
                                    <span className="leader-name">
                                        {leader.username}
                                        {leader.id === user.id && " (Вы)"}
                                    </span>
                                    <span className="leader-score">{leader.total_score? leader.total_score : '0'} баллов</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaderboardPage;
