using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Centralized audio management system with dynamic AudioSource creation
/// Handles music, ambient sounds, and sound effects with independent volume control
/// </summary>
public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }

    [Header("Volume Settings")]
    [SerializeField] [Range(0f, 1f)] private float musicVolume = 0.7f;
    [SerializeField] [Range(0f, 1f)] private float ambientVolume = 0.5f;
    [SerializeField] [Range(0f, 1f)] private float sfxVolume = 1.0f;

    [Header("Crossfade Settings")]
    [SerializeField] private float crossfadeDuration = 2.0f;

    // Audio source management
    private AudioSource musicSource;
    private AudioSource crossfadeMusicSource; // For music transitions
    private List<AudioSource> ambientSources = new List<AudioSource>();
    private List<AudioSource> sfxSourcePool = new List<AudioSource>();
    private const int SFX_POOL_SIZE = 10;

    // Current playback tracking
    private AudioClip currentMusicClip;
    private List<AudioClip> currentAmbientClips = new List<AudioClip>();

    private void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);

        // Initialize audio sources
        InitializeAudioSources();
    }

    /// <summary>
    /// Initialize all audio sources and pool
    /// </summary>
    private void InitializeAudioSources()
    {
        // Create main music source
        musicSource = CreateAudioSource("MusicSource", musicVolume, true);

        // Create crossfade music source (disabled by default)
        crossfadeMusicSource = CreateAudioSource("CrossfadeMusicSource", musicVolume, true);
        crossfadeMusicSource.volume = 0f;

        // Pre-create SFX source pool
        for (int i = 0; i < SFX_POOL_SIZE; i++)
        {
            AudioSource sfxSource = CreateAudioSource($"SFXSource_{i}", sfxVolume, false);
            sfxSourcePool.Add(sfxSource);
        }

        Debug.Log("AudioManager: Initialized with music, crossfade, and SFX pool");
    }

    /// <summary>
    /// Create a new AudioSource as a child of this GameObject
    /// </summary>
    private AudioSource CreateAudioSource(string name, float volume, bool loop)
    {
        GameObject sourceObj = new GameObject(name);
        sourceObj.transform.SetParent(transform);
        AudioSource source = sourceObj.AddComponent<AudioSource>();
        source.volume = volume;
        source.loop = loop;
        source.playOnAwake = false;
        return source;
    }

    #region Music Control

    /// <summary>
    /// Play music immediately (stops current music)
    /// </summary>
    public void PlayMusic(AudioClip clip, bool loop = true)
    {
        if (clip == null)
        {
            Debug.LogWarning("AudioManager: Cannot play null music clip");
            return;
        }

        StopMusic();
        currentMusicClip = clip;
        musicSource.clip = clip;
        musicSource.loop = loop;
        musicSource.volume = musicVolume;
        musicSource.Play();
        Debug.Log($"AudioManager: Playing music '{clip.name}'");
    }

    /// <summary>
    /// Crossfade to new music track
    /// </summary>
    public void CrossfadeMusic(AudioClip newClip, float duration = -1f)
    {
        if (newClip == null)
        {
            Debug.LogWarning("AudioManager: Cannot crossfade to null music clip");
            return;
        }

        if (duration < 0)
            duration = crossfadeDuration;

        StartCoroutine(CrossfadeMusicCoroutine(newClip, duration));
    }

    private IEnumerator CrossfadeMusicCoroutine(AudioClip newClip, float duration)
    {
        Debug.Log($"AudioManager: Crossfading to music '{newClip.name}' over {duration}s");

        // Setup crossfade source
        crossfadeMusicSource.clip = newClip;
        crossfadeMusicSource.loop = true;
        crossfadeMusicSource.volume = 0f;
        crossfadeMusicSource.Play();

        float elapsed = 0f;
        float startVolume = musicSource.volume;

        // Crossfade
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;

            musicSource.volume = Mathf.Lerp(startVolume, 0f, t);
            crossfadeMusicSource.volume = Mathf.Lerp(0f, musicVolume, t);

            yield return null;
        }

        // Complete transition
        musicSource.Stop();
        musicSource.volume = musicVolume;

        // Swap sources
        AudioSource temp = musicSource;
        musicSource = crossfadeMusicSource;
        crossfadeMusicSource = temp;

        currentMusicClip = newClip;
        Debug.Log($"AudioManager: Crossfade complete");
    }

    /// <summary>
    /// Stop music playback
    /// </summary>
    public void StopMusic(bool fade = false, float fadeDuration = 1f)
    {
        if (fade && musicSource.isPlaying)
        {
            StartCoroutine(FadeOutMusicCoroutine(fadeDuration));
        }
        else
        {
            musicSource.Stop();
            currentMusicClip = null;
            Debug.Log("AudioManager: Music stopped");
        }
    }

    private IEnumerator FadeOutMusicCoroutine(float duration)
    {
        float startVolume = musicSource.volume;
        float elapsed = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            musicSource.volume = Mathf.Lerp(startVolume, 0f, elapsed / duration);
            yield return null;
        }

        musicSource.Stop();
        musicSource.volume = musicVolume;
        currentMusicClip = null;
        Debug.Log("AudioManager: Music faded out");
    }

    /// <summary>
    /// Set music volume
    /// </summary>
    public void SetMusicVolume(float volume)
    {
        musicVolume = Mathf.Clamp01(volume);
        musicSource.volume = musicVolume;
    }

    #endregion

    #region Ambient Control

    /// <summary>
    /// Play ambient sound on loop (allows multiple simultaneous ambient sounds)
    /// </summary>
    public AudioSource PlayAmbient(AudioClip clip, float volume = -1f)
    {
        if (clip == null)
        {
            Debug.LogWarning("AudioManager: Cannot play null ambient clip");
            return null;
        }

        // Check if already playing
        foreach (var source in ambientSources)
        {
            if (source.clip == clip && source.isPlaying)
            {
                Debug.Log($"AudioManager: Ambient '{clip.name}' already playing");
                return source;
            }
        }

        // Create new ambient source
        AudioSource ambientSource = CreateAudioSource($"Ambient_{clip.name}", volume >= 0 ? volume : ambientVolume, true);
        ambientSource.clip = clip;
        ambientSource.Play();
        ambientSources.Add(ambientSource);
        currentAmbientClips.Add(clip);

        Debug.Log($"AudioManager: Playing ambient '{clip.name}'");
        return ambientSource;
    }

    /// <summary>
    /// Stop specific ambient sound
    /// </summary>
    public void StopAmbient(AudioClip clip)
    {
        for (int i = ambientSources.Count - 1; i >= 0; i--)
        {
            if (ambientSources[i].clip == clip)
            {
                ambientSources[i].Stop();
                Destroy(ambientSources[i].gameObject);
                ambientSources.RemoveAt(i);
                currentAmbientClips.Remove(clip);
                Debug.Log($"AudioManager: Stopped ambient '{clip.name}'");
            }
        }
    }

    /// <summary>
    /// Stop all ambient sounds
    /// </summary>
    public void StopAllAmbient()
    {
        foreach (var source in ambientSources)
        {
            if (source != null)
            {
                source.Stop();
                Destroy(source.gameObject);
            }
        }
        ambientSources.Clear();
        currentAmbientClips.Clear();
        Debug.Log("AudioManager: All ambient sounds stopped");
    }

    /// <summary>
    /// Set ambient volume
    /// </summary>
    public void SetAmbientVolume(float volume)
    {
        ambientVolume = Mathf.Clamp01(volume);
        foreach (var source in ambientSources)
        {
            if (source != null)
                source.volume = ambientVolume;
        }
    }

    #endregion

    #region SFX Control

    /// <summary>
    /// Play a one-shot sound effect
    /// </summary>
    public void PlaySFX(AudioClip clip, float volume = -1f)
    {
        if (clip == null)
        {
            Debug.LogWarning("AudioManager: Cannot play null SFX clip");
            return;
        }

        AudioSource source = GetAvailableSFXSource();
        if (source != null)
        {
            source.clip = clip;
            source.volume = volume >= 0 ? volume : sfxVolume;
            source.loop = false;
            source.Play();
            Debug.Log($"AudioManager: Playing SFX '{clip.name}'");
        }
    }

    /// <summary>
    /// Play a sound effect at a specific position in 3D space
    /// </summary>
    public void PlaySFXAtPosition(AudioClip clip, Vector3 position, float volume = -1f)
    {
        if (clip == null)
        {
            Debug.LogWarning("AudioManager: Cannot play null SFX clip");
            return;
        }

        AudioSource.PlayClipAtPoint(clip, position, volume >= 0 ? volume : sfxVolume);
        Debug.Log($"AudioManager: Playing SFX '{clip.name}' at position {position}");
    }

    /// <summary>
    /// Play a looping sound effect (returns the AudioSource for manual control)
    /// </summary>
    public AudioSource PlayLooping(AudioClip clip, float volume = -1f)
    {
        if (clip == null)
        {
            Debug.LogWarning("AudioManager: Cannot play null looping clip");
            return null;
        }

        AudioSource source = GetAvailableSFXSource();
        if (source != null)
        {
            source.clip = clip;
            source.volume = volume >= 0 ? volume : sfxVolume;
            source.loop = true;
            source.Play();
            Debug.Log($"AudioManager: Playing looping SFX '{clip.name}'");
            return source;
        }
        return null;
    }

    /// <summary>
    /// Get an available SFX source from the pool (or create a new one if all busy)
    /// </summary>
    private AudioSource GetAvailableSFXSource()
    {
        // Find available source from pool
        foreach (var source in sfxSourcePool)
        {
            if (!source.isPlaying)
                return source;
        }

        // All sources busy, create a new one
        AudioSource newSource = CreateAudioSource($"SFXSource_{sfxSourcePool.Count}", sfxVolume, false);
        sfxSourcePool.Add(newSource);
        Debug.Log("AudioManager: Created additional SFX source (pool expanded)");
        return newSource;
    }

    /// <summary>
    /// Set SFX volume
    /// </summary>
    public void SetSFXVolume(float volume)
    {
        sfxVolume = Mathf.Clamp01(volume);
    }

    #endregion

    #region Global Control

    /// <summary>
    /// Stop all audio (music, ambient, and SFX)
    /// </summary>
    public void StopAll()
    {
        StopMusic();
        StopAllAmbient();

        foreach (var source in sfxSourcePool)
        {
            if (source != null && source.isPlaying)
                source.Stop();
        }

        Debug.Log("AudioManager: All audio stopped");
    }

    /// <summary>
    /// Pause all audio
    /// </summary>
    public void PauseAll()
    {
        musicSource.Pause();
        crossfadeMusicSource.Pause();

        foreach (var source in ambientSources)
        {
            if (source != null)
                source.Pause();
        }

        foreach (var source in sfxSourcePool)
        {
            if (source != null && source.isPlaying)
                source.Pause();
        }

        Debug.Log("AudioManager: All audio paused");
    }

    /// <summary>
    /// Resume all audio
    /// </summary>
    public void ResumeAll()
    {
        musicSource.UnPause();
        crossfadeMusicSource.UnPause();

        foreach (var source in ambientSources)
        {
            if (source != null)
                source.UnPause();
        }

        foreach (var source in sfxSourcePool)
        {
            if (source != null)
                source.UnPause();
        }

        Debug.Log("AudioManager: All audio resumed");
    }

    /// <summary>
    /// Set master volume for all audio
    /// </summary>
    public void SetMasterVolume(float volume)
    {
        AudioListener.volume = Mathf.Clamp01(volume);
    }

    #endregion

    #region Debug Methods

    [ContextMenu("Debug: Print Audio Status")]
    private void DebugPrintStatus()
    {
        Debug.Log("=== AudioManager Status ===");
        Debug.Log($"Music: {(musicSource.isPlaying ? currentMusicClip?.name ?? "Unknown" : "Not Playing")}");
        Debug.Log($"Ambient Tracks: {ambientSources.Count}");
        foreach (var clip in currentAmbientClips)
        {
            Debug.Log($"  - {clip.name}");
        }
        Debug.Log($"Active SFX Sources: {sfxSourcePool.FindAll(s => s.isPlaying).Count}/{sfxSourcePool.Count}");
        Debug.Log("==========================");
    }

    #endregion
}

