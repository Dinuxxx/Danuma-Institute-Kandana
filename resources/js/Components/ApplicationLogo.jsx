export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/images/logo.png"
            alt="Application Logo"
            className={props.className || "h-10 w-auto"} // Default height if not provided
        />
    );
}
