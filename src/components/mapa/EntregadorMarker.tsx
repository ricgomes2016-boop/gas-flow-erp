import L from "leaflet";

// Custom delivery person icon
export const createEntregadorIcon = (isSelected: boolean = false) => new L.DivIcon({
  className: "custom-entregador-icon",
  html: `
    <div style="
      background: ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--success))'};
      width: ${isSelected ? '48px' : '40px'};
      height: ${isSelected ? '48px' : '40px'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>
  `,
  iconSize: [isSelected ? 48 : 40, isSelected ? 48 : 40],
  iconAnchor: [isSelected ? 24 : 20, isSelected ? 48 : 40],
});

// Custom client/destination icon
export const createClienteIcon = (isPendente: boolean = true) => new L.DivIcon({
  className: "custom-cliente-icon",
  html: `
    <div style="
      background: ${isPendente ? 'hsl(var(--warning))' : 'hsl(var(--muted))'};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Percurso icon (waypoint)
export const createPercursoIcon = (index: number) => new L.DivIcon({
  className: "custom-percurso-icon",
  html: `
    <div style="
      background: hsl(var(--muted-foreground));
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      font-size: 10px;
      font-weight: bold;
      color: white;
    ">
      ${index + 1}
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});
