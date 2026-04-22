export default {
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftCol: {
    flex: 4,
    backgroundColor: '#F2F9EC', // Solid light matcha color
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoGlow: {
    shadowColor: '#4A924C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
    marginBottom: 32,
    borderRadius: 36,
  },
  logoWrap: {
    width: 130,
    height: 130,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#49934F',
  },
  brandTitle: {
    fontSize: 50,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 60,
  },
  rightCol: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: '#FFFFFF', // Solid pure white
    position: 'relative',
    overflow: 'hidden',
  },
  contentWrap: {
    width: '100%',
    maxWidth: 700, // Tăng maxWidth để chữ full 1 dòng
  },
  // Tăng opacity cho họa tiết rõ hơn
  decor1: { position: 'absolute', top: '15%', left: '10%', fontSize: 90, opacity: 0.08, transform: [{ rotate: '-20deg' }] },
  decor2: { position: 'absolute', bottom: '15%', right: '15%', fontSize: 110, opacity: 0.07, transform: [{ rotate: '15deg' }] },
  decor3: { position: 'absolute', top: '40%', right: '-15%', fontSize: 130, opacity: 0.06, transform: [{ rotate: '45deg' }] },
  decor4: { position: 'absolute', top: '20%', right: '10%', fontSize: 80, opacity: 0.06, transform: [{ rotate: '60deg' }] },
  decor5: { position: 'absolute', bottom: '20%', left: '5%', fontSize: 100, opacity: 0.06, transform: [{ rotate: '-30deg' }] },
  
  title: {
    fontSize: 44, // Giảm một tí để fit tốt hơn
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 24,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748B',
    marginBottom: 50,
    lineHeight: 26,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 24,
  },
  btnWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  btnPrimary: {
    paddingVertical: 18,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A924C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  btnSecondary: {
    paddingVertical: 18,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4A924C',
    backgroundColor: '#FFFFFF',
  },
  btnSecondaryText: {
    color: '#4A924C',
    fontSize: 16,
    fontWeight: '800',
  },
};
