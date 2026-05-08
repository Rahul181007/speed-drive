type SpinnerProps = {
    size?: string;
};

const Spinner = ({ size = "h-4 w-4" }: SpinnerProps) => {
    return (
        <div
            className={`${size} animate-spin rounded-full border-2 border-black border-t-transparent`}
        />
    );
};

export default Spinner;