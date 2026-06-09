function Logo() {
    return (
        <svg
            height="60"
            viewBox="0 0 265 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id="atlasGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
            </defs>

            <g stroke="currentColor" strokeWidth="2">
                <circle cx="20" cy="30" r="4" />
                <circle cx="40" cy="15" r="4" />
                <circle cx="40" cy="45" r="4" />
                <circle cx="60" cy="30" r="4" />

                <line x1="20" y1="30" x2="40" y2="15" />
                <line x1="20" y1="30" x2="40" y2="45" />
                <line x1="40" y1="15" x2="60" y2="30" />
                <line x1="40" y1="45" x2="60" y2="30" />
            </g>

            <text
                x="85"
                y="38"
                fontFamily="Inter, Arial, sans-serif"
                fontSize="20"
                fontWeight="700"
                fill="currentColor"
            >
                AGENT
            </text>

            <text
                x="160"
                y="38"
                fontFamily="Inter, Arial, sans-serif"
                fontSize="20"
                fontWeight="700"
                fill="url(#atlasGradient)"
            >
                ATLAS
            </text>
        </svg>
    )
}

export default Logo