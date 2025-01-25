const styles = {
  notificationsBadge: {
    size: 'large',
    overlap: 'circular',
    sx: {
      '& .MuiBadge-badge': {
        color: 'white',
        backgroundColor: '#9D74FF',
      },
    },
  },
  notificationsBox: {
    sx: {
      'min-width': 447,
      'min-height': 100,
      position: 'fixed',
      top: 70,
      right: 50,
      'border-radius': '20px',
      'background-color': '#0C0B1799',
    },
  },
  notificationsMenuBorder: {
    variant: 'outlined',
    sx: {
      'border-radius': '20px',
      border: '0.5px solid #9D7BFF',
    },
  },
  notificationsTitleBar: {
    sx: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      'margin-bottom': '10px',
    },
  },
  notificationsTitle: {
    sx: {
      fontFamily: 'Satoshi Regular',
      fontSize: '24px',
    },
  },
};
export default styles;
