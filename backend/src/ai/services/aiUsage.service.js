
import prisma from "../config/db.js";
import { PlanType, UserRole } from "@prisma/client";
import { getCurrentMonthYear } from "../utils/date.utils.js";
import { FREE_LIMITS } from "../config/aiTokensPlan.js";

export const getMyUsage = async (user) => {
    const { id: userId, plan, role } = user;
    const { month, year } = getCurrentMonthYear();

    // ADMIN → unlimited
    if (role === UserRole.ADMIN) {
        return {
            plan,
            month,
            year,
            limits: "UNLIMITED",
            used: "UNLIMITED",
            remaining: "UNLIMITED",
        };
    }

    // Get or create usage row
    let usage = await prisma.usageStat.findUnique({
        where: {
            userId_month_year: {
                userId,
                month,
                year,
            },
        },
    });

    if (!usage) {
        usage = await prisma.usageStat.create({
            data: {
                userId,
                month,
                year,
            },
        });
    }

    const used = {
        tasks: usage.taskCount,
        schedules: usage.scheduleCount,
        behaviors: usage.behaviorCount,
    };

    // Paid plans → unlimited limits
    if (plan !== PlanType.FREE) {
        return {
            plan,
            month,
            year,
            limits: "UNLIMITED",
            used,
            remaining: "UNLIMITED",
        };
    }

    // FREE plan
    const remaining = {
        tasks: Math.max(0, FREE_LIMITS.tasks - used.tasks),
        schedules: Math.max(0, FREE_LIMITS.schedules - used.schedules),
        behaviors: Math.max(0, FREE_LIMITS.behaviors - used.behaviors),
    };

    return {
        plan,
        month,
        year,
        limits: FREE_LIMITS,
        used,
        remaining,
    };
};