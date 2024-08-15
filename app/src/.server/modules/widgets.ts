import fs from "node:fs/promises";

type WidgetFont = Buffer | null;
type Fonts = "montserrat" | "montserratSemiBold";

const widgetFonts: Record<Fonts, WidgetFont> = {
    montserrat: null,
    montserratSemiBold: null
};

export async function getWidgetFonts(): Promise<Record<Fonts, NonNullable<WidgetFont>>> {
    if (widgetFonts.montserrat && widgetFonts.montserratSemiBold)
        return widgetFonts as Record<Fonts, NonNullable<WidgetFont>>;

    const [montserrat, montserratSemiBold] = await Promise.all([
        fs.readFile("./public/Montserrat.otf"),
        fs.readFile("./public/MontserratSemibold.otf")
    ]);

    widgetFonts.montserrat = montserrat;
    widgetFonts.montserratSemiBold = montserratSemiBold;

    return widgetFonts as Record<Fonts, NonNullable<WidgetFont>>;
}
