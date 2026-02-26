import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createTaskTool, updateTaskTool, deleteTaskTool, listTasksTool } from "../../tools/task.tool.js";
import { createScheduleTool, updateScheduleTool, deleteScheduleTool, listSchedulesTool } from "../../tools/schedule.tool.js";
import { createTavilyTool } from "../../tools/tavily.tool.js";
import { updateProfileTool } from "../../tools/profile.tool.js";
import { logBehaviorTool } from "../../tools/behavior.tool.js";
import { checkUsageTool } from "../../tools/usage.tool.js";

export const getBoundTools = () => {
    return [
        createTaskTool(),
        updateTaskTool(),
        deleteTaskTool(),
        listTasksTool(),
        createScheduleTool(),
        updateScheduleTool(),
        deleteScheduleTool(),
        listSchedulesTool(),
        createTavilyTool(process.env.TAVILY_API_KEY),
        updateProfileTool(),
        logBehaviorTool(),
        checkUsageTool()
    ];
};

export const createToolNode = (tools) => {
    return new ToolNode(tools, {
        configKey: "configurable"
    });
};
