import StatsCard from "./StatsCard"
import { useTasks } from "../../context/Taskscontext"
import StreakMeter from "./streakmeter"

const Overview = () => {
    const { streakOverview } = useTasks()
    const completionRate = 80
    const stats = {
        total: 10,
        completed: 5,
        pending: 4,
        missed: 1,
    }

    return (
        <>
            <h2 className="text-xl font-semibold mb-6">Overview</h2>

            <div className=" grid md:grid-cols-4 gap-4">
                <StatsCard label="Total Tasks" value={stats.total} />
                <StatsCard label="Completed" value={stats.completed} />
                <StatsCard label="Pending" value={stats.pending} />
                <StatsCard label="Missed" value={stats.missed} />
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StreakMeter value={40} label="Consistency Score" />
                <StreakMeter value={60} label="Weekly Performance" />
                <StreakMeter value={100} label="Monthly Performance" />
            </div>

            <div className=" flex justify-center item-center gap-10 my-10 ">
                <div className="p-4 border rounded">
                    <p className="text-sm opacity-60">Current Streak</p>
                    <p className="text-2xl font-semibold">
                        🔥 {streakOverview.currentStreak} days
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <p className="text-sm opacity-60">Longest Streak</p>
                    <p className="text-2xl font-semibold">
                        🏆 {streakOverview.longestStreak} days
                    </p>
                </div>

            </div>


        </>
    )
}

export default Overview
