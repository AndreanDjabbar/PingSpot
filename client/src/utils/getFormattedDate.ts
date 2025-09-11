export const formattedDate = (
    isoString: string,
    type: "date" | "datetime" = "date"
): string => {
    if (!isoString || isoString === "") return "";

    const d = new Date(isoString);

    if (type === "date") {
        return d.toISOString().split("T")[0];
    }

    if (type === "datetime") {
        const date = d.toISOString().split("T")[0];
        const time = d.toISOString().slice(11, 16);
        return `${date} ${time}`;
    }

    return isoString;
};
