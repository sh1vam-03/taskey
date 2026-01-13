export const requireAiTokens = async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });

    if (user.aiTokenBalance <= 0) {
        return res.status(403).json({
            message: "AI tokens exhausted. Please upgrade or top up.",
        });
    }

    next();
};
