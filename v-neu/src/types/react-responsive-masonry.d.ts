declare module "react-responsive-masonry" {
    import { ReactNode } from "react";

    interface MasonryProps {
        columnsCountBreakPoints?: Record<number, number>;
        gutter?: string;
        className?: string;
        style?: React.CSSProperties;
        children?: ReactNode;
    }

    interface ResponsiveMasonryProps {
        columnsCountBreakPoints?: Record<number, number>;
        className?: string;
        style?: React.CSSProperties;
        children?: ReactNode;
    }

    export default function Masonry(props: MasonryProps): JSX.Element;
    export function ResponsiveMasonry(props: ResponsiveMasonryProps): JSX.Element;
}
