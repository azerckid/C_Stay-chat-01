import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * 가벼운 터치 피드백 (버튼 클릭 등)
 */
export async function hapticLight() {
    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        // 웹이나 미지원 환경에서는 무시
    }
}

/**
 * 중간 강도 피드백 (중요한 액션)
 */
export async function hapticMedium() {
    try {
        await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
        // ignore
    }
}

/**
 * 강한 피드백 (삭제, 경고 등)
 */
export async function hapticHeavy() {
    try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
        // ignore
    }
}

/**
 * 성공 알림 진동 패턴
 */
export async function hapticSuccess() {
    try {
        await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
        // ignore
    }
}

/**
 * 에러 알림 진동 패턴
 */
export async function hapticError() {
    try {
        await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
        // ignore
    }
}
