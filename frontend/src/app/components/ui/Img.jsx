export default function Img({ src, alt = "", className = "", style = {} }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={style}
      lazy="loading"
    />
  );
}
