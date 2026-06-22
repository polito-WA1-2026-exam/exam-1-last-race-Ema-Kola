function NetworkMap({ mode }) {
    const src = mode === "full" ? "/map-full.png" : "/map-stations.png";
    const alt =
      mode === "full"
        ? "Film Metro network map showing all lines and stations"
        : "Film Metro stations, without line connections";
  
    return (
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          maxWidth: 580,
          border: "1px solid #dee2e6",
          borderRadius: 8,
          background: "#f8f9fa",
        }}
      />
    );
  }
  
  export default NetworkMap;