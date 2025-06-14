
const TitleComponent = ({
    title = "Default Title",
    subtitle = "Default Subtitle",
    className = "bg-red-400",
}) => {
  return (
    <div>
        <h1 className={`text-2xl text-white font-bold ${className}`}>
            {title}
        </h1>
        <p className="text-gray-500">{subtitle}</p>
    </div>
  )
}

export default TitleComponent