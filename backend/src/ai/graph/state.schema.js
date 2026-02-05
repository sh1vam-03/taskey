
/**
 * State Schema
 * Defines the channels for the LangGraph state.
 * For now, we use the standard 'messages' channel with a concat reducer.
 */
export const graphState = {
    messages: {
        reducer: (a, b) => a.concat(b),
        default: () => [],
    }
};
