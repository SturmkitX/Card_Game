window.addEventListener('load', () => {
    // decode URL data
    const dataParam = new URL(window.location.href).searchParams.get('data');
    if (!dataParam) {
        window.alert('Invalid connection data');
        return;
    }

    let data = JSON.parse(window.atob(dataParam));
    const socket = io(data.address);
});
